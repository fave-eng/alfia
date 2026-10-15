(() => {
  'use strict';
  const EXPECTED_VERSION = 'alfiya-diagnostics-v2';
  const EXPECTED_CHAT = '-1004473831246';
  const EXPECTED_THREAD = 5;
  const STUDENT_ID = 'alfiya';
  const config = window.APP_CONFIG || {};
  const student = config.student || {};
  const $ = id => document.getElementById(id);
  const elements = {
    checks: $('checks'), summary: $('main-summary'), raw: $('raw-output'),
    config: $('config-info'), telegram: $('telegram-info'),
    db: $('db-write-result'), send: $('send-result'),
    run: $('run-all'), dbBtn: $('test-db-write'), sendBtn: $('send-test-report'),
  };
  let client;
  const checks = [];
  let report = { studentId: STUDENT_ID, checks: [] };

  const normalizeError = err => String(err?.message || err?.error || err || 'Неизвестная ошибка');
  const redact = value => normalizeError(value).replace(/bot\d+:[A-Za-z0-9_-]+/g, 'bot[hidden]');
  const put = (parent, tag, text, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; el.textContent = String(text ?? ''); parent.append(el); return el; };
  function kv(target, key, value, mono = false) {
    const row = put(target,'div','', 'kv'); put(row,'span',key); put(row,'strong',value ?? '—', mono ? 'mono' : '');
  }
  function add(name, status, detail) {
    const row = put(elements.checks,'div','',`check ${status}`);
    put(row,'div',{ok:'✓',warn:'!',bad:'×'}[status] || '·','ico');
    const content = put(row,'div',''); put(content,'div',name,'name'); put(content,'div',detail,'detail');
    const item = {name,status,detail:String(detail || '')}; checks.push(item); report.checks = checks.slice();
  }
  function announce(el,status,msg){el.replaceChildren(); put(el,'div',msg,`summary ${status}`);}
  function summary(status,msg){elements.summary.className = `summary ${status}`;elements.summary.textContent = msg;}
  function reportText(){elements.raw.textContent = JSON.stringify(report,null,2);}
  function getClient(){
    if(client) return client;
    if(!window.supabase?.createClient) throw new Error('Supabase SDK не загрузился');
    const url=String(config.supabase?.url||''); const key=String(config.supabase?.anonKey||'');
    if(!url || !key) throw new Error('Не заполнены URL / публичный ключ в config.js');
    client=window.supabase.createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    return client;
  }
  async function invoke(body){
    const url=String(config.supabase?.url||'').replace(/\/+$/,'');
    const key=String(config.supabase?.anonKey||'');
    const fn=String(config.features?.telegramFunction||'notify-alfiya-telegram');
    if(!/^notify-alfiya-telegram$/.test(fn)) throw Error(`Неожиданное имя Edge Function: ${fn}`);
    if(!url || !key) throw Error('Не задан Supabase URL / anon key');
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),18000);
    try {
      const response = await fetch(`${url}/functions/v1/${fn}`,{method:'POST',mode:'cors',signal:controller.signal,
        headers:{'content-type':'application/json',apikey:key,authorization:`Bearer ${key}`,...(body.kind==='diagnostics_send_report' && elements.secret?.value?.trim() ? {'x-notify-secret':elements.secret.value.trim()} : {})},
        body:JSON.stringify({studentId:STUDENT_ID,...body})});
      const content = await response.text();
      let data;try{data=content?JSON.parse(content):{};}catch{data={error:content.slice(0,350)};}
      return {ok:response.ok,status:response.status,data};
    } finally {clearTimeout(timeout);}
  }
  function edgeError(response){
    if(response.status===404) return 'Функция notify-alfiya-telegram не развёрнута (HTTP 404).';
    if(response.status===401 || response.status===403) return `Авторизация отклонена (HTTP ${response.status}). Проверь verify_jwt и функцию.`;
    return `HTTP ${response.status}: ${redact(response.data?.error || response.data?.message || 'нет данных')}`;
  }
  async function fileCheck(title,path,kind='file'){
    try{
      const res=await fetch(path,{cache:'no-store'});
      if(!res.ok){add(title,'bad',`${path}: HTTP ${res.status}`);return null;}
      if(kind==='json'){
        const payload=await res.json();
        if(payload.id!=='lesson-1' || !Array.isArray(payload.blocks)) throw Error('Некорректная структура урока');
        add(title,'ok',`${path}: JSON корректен, блоков: ${payload.blocks.length}`);
        return payload;
      }
      add(title,'ok',`${path}: HTTP ${res.status}`);return true;
    }catch(err){add(title,'bad',`${path}: ${redact(err)}`);return null;}
  }
  async function runAll(){
    elements.run.disabled=true;checks.length=0;elements.checks.replaceChildren();
    elements.telegram.replaceChildren();
    report={studentId:STUDENT_ID,startedAt:new Date().toISOString(),checks:[],errors:[]};
    summary('','Проверка выполняется…');
    try{
      const validConfig=student.id===STUDENT_ID && student.level==='A1' &&
        Boolean(config.supabase?.url && config.supabase?.anonKey);
      add('1. Конфигурация и курс',validConfig?'ok':'bad',validConfig?'student_id=alfiya; Speakout A1; Supabase URL и ключ присутствуют.':'Ожидается alfiya / A1 и заполненные параметры Supabase.');
      add('2. Supabase JS SDK',window.supabase?.createClient?'ok':'bad',window.supabase?.createClient?'Библиотека загружена.':'Библиотека из CDN не загрузилась.');
      const lesson=await fileCheck('3. Первое домашнее задание','data/lessons/lesson-1.json','json');
      await fileCheck('4. База грамматики','data/grammar-data.js');
      await fileCheck('5. База словаря','data/vocabulary-data.js');
      await fileCheck('6. Knowledge Base','knowledge-base.html');
      if(lesson){
        const media = [...new Set((lesson.blocks||[]).flatMap(b=>[b.audio,...(b.scenes||[]).map(s=>s.image),...(b.profiles||[]).map(p=>p.image)].filter(Boolean)))];
        let missing=[];
        for(const path of media){try{const r=await fetch(path,{method:'HEAD',cache:'no-store'});if(!r.ok)missing.push(`${path} (HTTP ${r.status})`);}catch{missing.push(path);}}
        add('7. Аудио и изображения',missing.length?'warn':'ok',missing.length?`Недоступно: ${missing.join('; ')}`:`Проверены ${media.length} локальных медиафайлов.`);
      }else add('7. Аудио и изображения','warn','Нельзя проверить: урок не загрузился.');
      let browserCounts={};let hasDb=false;
      if(validConfig && window.supabase?.createClient){
        const db=getClient();hasDb=true;
        const tables={homework:config.supabase.tables?.homework||'homework_progress',vocabulary:config.supabase.tables?.vocabulary||'vocabulary_progress',vocabularyTopics:config.supabase.tables?.vocabularyTopics||'vocabulary_topic_progress',grammar:config.supabase.tables?.grammar||'grammar_progress'};
        for(const [key,table] of Object.entries(tables)){
          try{
            const {count,error}=await db.from(table).select('*',{count:'exact',head:true}).eq('student_id',STUDENT_ID);
            if(error) throw error;
            browserCounts[key]=count||0;
            add(`Supabase / ${key}`, 'ok',`Чтение работает, строк Альфии: ${count||0}.`);
          }catch(err){add(`Supabase / ${key}`,'bad',redact(err));report.errors.push({stage:`read_${key}`,error:redact(err)});}
        }
      }else add('Supabase / чтение','bad','Нельзя проверить без конфигурации и SDK.');
      let health=null;
      try{
        const response=await invoke({kind:'diagnostics_health'});
        if(!response.ok){add('8. Edge Function','bad',edgeError(response));report.errors.push({stage:'edge_function',response});}
        else if(response.data?.diagnosticVersion!==EXPECTED_VERSION){add('8. Edge Function','bad',`Устаревшая версия: ${response.data?.diagnosticVersion||response.data?.version||'не определена'}. Нужен deploy обновлённой функции.`);}
        else {health=response.data;report.health=health;add('8. Edge Function','ok',`Развёрнута версия ${health.diagnosticVersion}.`);}
      }catch(err){add('8. Edge Function','bad',`Не удалось вызвать функцию: ${redact(err)} (сеть, CORS, URL или функция отсутствует).`);report.errors.push({stage:'edge_function',error:redact(err)});}
      if(health){
        const d=health.database||{};const r=health.recipient||{};const t=health.telegram||{};
        add('9. Supabase через service role',d.ok?'ok':'bad',d.ok?`Сервер видит ${d.homeworkRows} записей ДЗ.`:d.error||'Ошибка серверного доступа к данным.');
        const rlsOk=hasDb && typeof browserCounts.homework==='number' && d.ok && browserCounts.homework===d.homeworkRows;
        const noRows=rlsOk && d.homeworkRows===0;
        add('10. RLS: браузер и сервер',!rlsOk?'bad':noRows?'warn':'ok',!rlsOk?`Браузер: ${browserCounts.homework??'ошибка'}, сервер: ${d.homeworkRows??'ошибка'}.`:noRows?'Оба видят 0 строк: для полноценной проверки RLS запусти отдельный тест записи.':`Совпадает: ${browserCounts.homework} строк.`);
        add('11. Облачные ответы грамматики',d.grammarAnswersColumnOk?'ok':'warn',d.grammarAnswersColumnOk?'Колонка grammar_progress.answers доступна.':d.grammarAnswersColumnError||'Колонка answers отсутствует; ответы между устройствами не восстановятся.');
        add('12. Получатель Telegram',r.ok?'ok':'bad',r.ok?`Запись ученицы включена. chat_id=${r.chatId}.`:r.error||'Получатель не настроен.');
        const chatOk=r.ok && String(r.chatId)===EXPECTED_CHAT;
        add('13. Telegram chat_id',chatOk?'ok':'bad',r.ok?`Получен ${r.chatId}, ожидается ${EXPECTED_CHAT}.`:'Нет настроенного получателя.');
        const threadOk=r.ok && Number(r.threadId)===EXPECTED_THREAD;
        add('14. Telegram thread_id',threadOk?'ok':'bad',r.ok?`Получен ${r.threadId??'NULL'}, ожидается ${EXPECTED_THREAD}.`:'Нет настроенного получателя.');
        add('15. Bot API: бот',t.bot?.ok?'ok':'bad',t.bot?.ok?`Бот @${t.bot.username||'без имени'} доступен.`:t.bot?.error||'Не удалось вызвать Telegram getMe.');
        add('16. Bot API: группа',t.chat?.ok?'ok':'bad',t.chat?.ok?`Telegram видит группу (${t.chat.type||'тип не определён'}).`:t.chat?.error||'Нет доступа к чату (getChat).');
        const suspicious=Array.isArray(d.suspiciousHomework)?d.suspiciousHomework:[];
        add('17. Состояние сохранённых ДЗ',suspicious.length?'warn':'ok',suspicious.length?`Неожиданные статусы у ${suspicious.join(', ')}.`:'Неожиданных статусов не обнаружено.');
        const log=health.reportLog||{};const fails=log.pendingOrFailed||[];
        add('18. Журнал отчётов ДЗ',log.ok===false?'bad':fails.length?'warn':'ok',log.ok===false?(log.error||'Таблица логов отсутствует.'):fails.length?`Неотправленные/ошибочные: ${fails.map(x=>x.lessonId+' ('+x.status+')').join(', ')}`:'Нет незавершённых отправок в последних записях.');
        const p=health.notificationLog||{};
        add('19. Журнал уведомлений о новых ДЗ',p.ok===false?'bad':p.failedCount?'warn':'ok',p.ok===false?(p.error||'Не читается журнал публикаций.'):p.failedCount?`Ошибочных записей: ${p.failedCount}.`:'Журнал новых материалов доступен.');
        elements.telegram.replaceChildren();
        kv(elements.telegram,'Получатель',r.ok?'найден':'не настроен');kv(elements.telegram,'Chat ID',r.chatId??'—',true);kv(elements.telegram,'Thread ID',r.threadId??'—',true);kv(elements.telegram,'Enabled',String(Boolean(r.enabled)));kv(elements.telegram,'Bot',t.bot?.username?'@'+t.bot.username:'недоступен');kv(elements.telegram,'getChat',t.chat?.ok?'OK':'ERROR');
      }else{
        add('9–19. Сервер, RLS, Telegram и журналы','warn','Нет достоверного ответа от Edge Function. После deploy эти проверки станут доступны.');
      }
      const bad=checks.filter(x=>x.status==='bad').length;const warn=checks.filter(x=>x.status==='warn').length;
      summary(bad?'bad':warn?'warn':'ok', bad?`Ошибок: ${bad}; предупреждений: ${warn}. Исправь красные строки.`:warn?`Ошибок нет, предупреждений: ${warn}.`:'Все автоматические проверки прошли. Для полного теста отдельно проверь запись и отправку Telegram.');
    }catch(err){add('Проверка остановлена','bad',redact(err));summary('bad',redact(err));report.errors.push({stage:'fatal',error:redact(err)});}
    finally{report.finishedAt=new Date().toISOString();reportText();elements.run.disabled=false;}
  }
  async function testDbWrite(){
    elements.dbBtn.disabled=true;announce(elements.db,'','Проверяю запись и удаление…');
    const probe=`__alfiya_diag__${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const table=config.supabase?.tables?.homework||'homework_progress';let inserted=false,removed=false;
    try{
      const db=getClient();
      const {error:insertError}=await db.from(table).insert({student_id:STUDENT_ID,student_name:student.nameRu||'Alfiya',lesson_id:probe,lesson_title:'Diagnostics probe',status:'draft',answers:{diagnostic:true}});
      if(insertError) throw insertError;inserted=true;
      const {data,error:readError}=await db.from(table).select('lesson_id,status').eq('student_id',STUDENT_ID).eq('lesson_id',probe).maybeSingle();
      if(readError) throw readError;if(!data) throw Error('Созданная запись не видна браузеру: проверь SELECT RLS.');
      const server=await invoke({kind:'diagnostics_verify_probe',lessonId:probe});
      if(!server.ok||!server.data?.ok) throw Error(server.data?.error||edgeError(server));
      report.databaseWriteProbe={ok:true,lessonId:probe,browserRead:true,serverRead:true};
    }catch(err){report.databaseWriteProbe={ok:false,lessonId:probe,error:redact(err)};}
    finally{
      if(inserted){
        try{
          const cleanup=await invoke({kind:'diagnostics_cleanup_probe',lessonId:probe});
          removed=Boolean(cleanup.ok && cleanup.data?.ok && cleanup.data?.removed);
        }catch{}
        if(!removed){try{const {error}=await getClient().from(table).delete().eq('student_id',STUDENT_ID).eq('lesson_id',probe);if(!error){const {data}=await getClient().from(table).select('lesson_id').eq('student_id',STUDENT_ID).eq('lesson_id',probe).maybeSingle();removed=!data;}}catch{}}
      }
      if(!inserted || report.databaseWriteProbe.ok===false){announce(elements.db,'bad',`Проверка не пройдена: ${report.databaseWriteProbe.error||'Не удалось создать запись'}. ${inserted?(removed?'Тестовая запись удалена.':`Внимание: проверь оставшуюся запись ${probe}.`):'Данные не изменены.'}`);}
      else if(!removed){announce(elements.db,'bad',`Запись и чтение работают, но не подтверждено удаление тестовой записи ${probe}.`);report.databaseWriteProbe.ok=false;}
      else {announce(elements.db,'ok','Запись → чтение браузером → чтение сервером → удаление выполнены. Настоящие ДЗ не изменены.');report.databaseWriteProbe.removed=true;}
      reportText();elements.dbBtn.disabled=false;
    }
  }
  async function sendTest(){
    if(!elements.secret?.value?.trim()){announce(elements.send,'warn','Укажи NOTIFY_WEBHOOK_SECRET преподавателя. Он не сохраняется в браузере и не включается в отчёт.');return;}
    elements.sendBtn.disabled=true;announce(elements.send,'','Отправляю тестовое сообщение…');
    try{
      const res=await invoke({kind:'diagnostics_send_report',pageUrl:window.location.href});
      if(!res.ok || !res.data?.ok) throw Error(res.data?.error||edgeError(res));
      report.telegramTest=res.data;
      if(res.data.skipped) announce(elements.send,'warn',`Сообщение недавно уже отправлено. Повтори через ${res.data.retryAfterSeconds||60} сек.`);
      else announce(elements.send,'ok',`Telegram принял сообщение. message_id=${res.data.telegramMessageId}; thread_id=${res.data.threadId}. Проверь тему Альфии.`);
    }catch(err){report.telegramTest={ok:false,error:redact(err)};announce(elements.send,'bad',`Тест не выполнен: ${redact(err)}`);}
    finally{elements.sendBtn.disabled=false;reportText();}
  }
  function renderConfig(){
    elements.config.replaceChildren();
    kv(elements.config,'Student ID',student.id||'—',true);kv(elements.config,'Имя',student.nameRu||student.nameEn||'—');
    kv(elements.config,'Курс',`${student.level||'?'} · ${student.textbook||'?'}`);
    kv(elements.config,'Supabase',config.supabase?.url||'нет URL',true);kv(elements.config,'Anon key',config.supabase?.anonKey?'есть':'не указан');
    kv(elements.config,'Cloud sync',String(config.features?.cloudSync!==false));kv(elements.config,'Telegram',String(config.features?.telegramNotifications!==false));
    kv(elements.config,'Edge function',config.features?.telegramFunction||'не задан',true);
  }
  elements.run.addEventListener('click',runAll);
  elements.dbBtn.addEventListener('click',testDbWrite);
  elements.sendBtn.addEventListener('click',sendTest);
  $('reload-page').addEventListener('click',()=>window.location.reload());
  $('copy-report').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(elements.raw.textContent);$('copy-report').textContent='Скопировано ✓';}
    catch{window.prompt('Скопируй отчёт:',elements.raw.textContent);}
  });
  renderConfig();
})();
