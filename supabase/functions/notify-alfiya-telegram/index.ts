import { createClient } from 'npm:@supabase/supabase-js@2'

// Dedicated function for Alfiya: does NOT replace notify-telegram for existing students.
const VERSION = 'alfiya-telegram-v1'
const STUDENT_ID = 'alfiya'
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-notify-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const result = (body: Record<string, unknown>, status = 200) => Response.json({ ...body, version: VERSION }, { status, headers })
const txt = (v: unknown) => v === undefined || v === null ? '' : String(v)
const esc = (v: unknown) => txt(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const ADMIN_URL = Deno.env.get('SUPABASE_URL') || ''
const ADMIN_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const BOT = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const WEBHOOK_SECRET = Deno.env.get('NOTIFY_WEBHOOK_SECRET') || ''
const PUBLIC_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''
const admin = (ADMIN_URL && ADMIN_KEY) ? createClient(ADMIN_URL, ADMIN_KEY, { auth: { persistSession: false } }) : null

function permittedPublicRequest(req: Request): boolean {
  const apiKey = (req.headers.get('apikey') || '').trim()
  const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i,'').trim()
  return Boolean(PUBLIC_KEY && apiKey === PUBLIC_KEY && bearer === PUBLIC_KEY)
}

async function recipient() {
  if (!admin) throw new Error('Supabase service client is not configured')
  const { data, error } = await admin.from('telegram_recipients')
    .select('chat_id,message_thread_id,enabled').eq('student_id', STUDENT_ID).maybeSingle()
  if (error) throw error
  if (!data || !data.enabled) throw new Error('Telegram recipient for Alfiya is not configured')
  return data
}

async function sendTelegram(rec: any, message: string) {
  if (!BOT) throw new Error('TELEGRAM_BOT_TOKEN is not set')
  const data: Record<string, unknown> = {
    chat_id: rec.chat_id, text: message, parse_mode: 'HTML', disable_web_page_preview: true,
  }
  if (rec.message_thread_id !== null && rec.message_thread_id !== undefined) {
    data.message_thread_id = rec.message_thread_id
  }
  const response = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(data),
  })
  const content = await response.json().catch(() => null)
  if (!response.ok || !content?.ok) throw new Error(content?.description || `Telegram HTTP ${response.status}`)
  return content.result?.message_id
}

async function homeworkReport(lessonId: string) {
  if (!admin) return result({ ok: false, error: 'Service database is not configured' }, 503)
  if (!/^lesson-\d+$/.test(lessonId)) return result({ ok: false, error: 'Invalid lesson ID' }, 400)
  const { data: row, error: queryError } = await admin.from('homework_progress')
    .select('lesson_id,lesson_title,student_id,status,submitted_at,score_correct,score_total,score_percent')
    .eq('student_id', STUDENT_ID).eq('lesson_id', lessonId).maybeSingle()
  if (queryError) return result({ ok: false, error: 'Could not read homework report' }, 500)
  if (!row || row.status !== 'submitted' || !row.submitted_at) {
    return result({ ok:false, error:'No submitted homework report found' }, 409)
  }
  const { data: existing, error: readError } = await admin.from('alfiya_homework_deliveries')
    .select('status').eq('lesson_id',lessonId).eq('student_id',STUDENT_ID).maybeSingle()
  if (readError) return result({ok:false,error:'Report log is not configured'},500)
  if (existing?.status === 'sent') return result({ok:true,skipped:true,reason:'already_sent'})
  if (existing?.status === 'pending') return result({ok:true,skipped:true,reason:'in_progress'})
  const { error: reserveError } = await admin.from('alfiya_homework_deliveries').upsert({
    student_id:STUDENT_ID, lesson_id:lessonId, status:'pending', error_message:null,
  },{onConflict:'student_id,lesson_id'})
  if (reserveError) return result({ok:false,error:'Could not reserve delivery'},500)
  const correct = Number(row.score_correct || 0)
  const total = Number(row.score_total || 0)
  const percent = total ? Math.round(correct / total * 100) : null
  const phrases = ['A little progress every day.', 'One step at a time.', 'Practice makes progress.', 'Well done for showing up.']
  const index = Number(lessonId.match(/\d+/)?.[0] || 1)
  const message = [
    '📝 <b>Alfiya · Homework submitted</b>',
    `<b>${esc(row.lesson_title || lessonId)}</b>`,
    total ? `Automatic check: <b>${correct}/${total}</b> (${percent}%)` : 'Written responses require teacher review.',
    'Written answers: check the progress row in Supabase.',
    '', phrases[(index - 1) % phrases.length],
  ].join('\n')
  try {
    const messageId = await sendTelegram(await recipient(), message)
    const { error: deliveredError } = await admin.from('alfiya_homework_deliveries').update({
      status:'sent', telegram_message_id:messageId, sent_at:new Date().toISOString(),error_message:null,
    }).eq('student_id',STUDENT_ID).eq('lesson_id',lessonId)
    if (deliveredError) throw deliveredError
    return result({ok:true,telegramMessageId:messageId})
  } catch (e) {
    await admin.from('alfiya_homework_deliveries').update({ status:'failed', error_message:'Telegram delivery failed' })
      .eq('student_id',STUDENT_ID).eq('lesson_id',lessonId)
    return result({ok:false,error: e instanceof Error ? e.message.replace(/bot\d+:[A-Za-z0-9_-]+/g,'bot[hidden]') : 'Telegram error'},502)
  }
}

async function materialNotice(data: any) {
  if (!admin) return result({ok:false,error:'Database is not configured'},503)
  const materialId = txt(data.materialId)
  const notificationVersion = Number(data.notificationVersion || 1)
  if (!/^lesson-\d+$/.test(materialId) || !Number.isSafeInteger(notificationVersion) || notificationVersion < 1) {
    return result({ok:false,error:'Invalid lesson metadata'},400)
  }
  const {data:existing,error:readError} = await admin.from('material_publications')
    .select('status').eq('student_id',STUDENT_ID).eq('material_type','lesson_bundle')
    .eq('material_id',materialId).eq('notification_version',notificationVersion).maybeSingle()
  if (readError) return result({ok:false,error:'Notification log is not configured'},500)
  if (existing?.status === 'sent' || existing?.status === 'pending') return result({ok:true,skipped:true,reason:'already_processed'})
  const {error:reserveError} = await admin.from('material_publications').upsert({
    student_id:STUDENT_ID,material_type:'lesson_bundle',material_id:materialId,
    notification_version:notificationVersion,status:'pending',payload:{lessonId:materialId},
  },{onConflict:'student_id,material_type,material_id,notification_version'})
  if (reserveError) return result({ok:false,error:'Could not reserve notification'},500)
  const homeworkTitle = txt(data.homework?.title).slice(0,120) || materialId
  const subtitle = txt(data.homework?.subtitle).slice(0,180)
  const grammar = Array.isArray(data.grammar) ? data.grammar.map((topic:any)=>txt(topic.title)).filter(Boolean).slice(0,3) : []
  const vocabulary = data.vocabulary?.wordCount ? `Vocabulary: ${Number(data.vocabulary.wordCount)} words` : null
  const versions = [
    '✨ <b>Hi! Your next English practice is ready.</b>',
    '📚 <b>New A1 homework is here!</b>',
    '👋 <b>Hello! Time for a little English practice.</b>',
    '🚀 <b>Small steps: your new homework is ready.</b>',
  ]
  const lessonNumber = Number(materialId.match(/\d+/)?.[0] || 1)
  const msg = [versions[(lessonNumber+notificationVersion-2)%versions.length], '',
    `<b>${esc(homeworkTitle)}</b>`, subtitle ? esc(subtitle):null,
    vocabulary, grammar.length ? `Grammar: ${esc(grammar.join(', '))}` : null,
    '', 'Complete the tasks, check your answers and submit your work.',
    data.homework?.url && /^https:\/\//i.test(data.homework.url) ? `<a href="${esc(data.homework.url)}">Open homework</a>` : null,
  ].filter(Boolean).join('\n')
  try {
    const messageId=await sendTelegram(await recipient(),msg)
    const {error}=await admin.from('material_publications').update({status:'sent',telegram_message_id:messageId,sent_at:new Date().toISOString()})
      .eq('student_id',STUDENT_ID).eq('material_type','lesson_bundle').eq('material_id',materialId)
      .eq('notification_version',notificationVersion)
    if (error) throw error
    return result({ok:true,telegramMessageId:messageId})
  } catch (e) {
    await admin.from('material_publications').update({status:'failed',error_message:'Telegram delivery failed'})
      .eq('student_id',STUDENT_ID).eq('material_type','lesson_bundle').eq('material_id',materialId)
      .eq('notification_version',notificationVersion)
    return result({ok:false,error:e instanceof Error ? e.message.replace(/bot\d+:[A-Za-z0-9_-]+/g,'bot[hidden]'):'Telegram error'},502)
  }
}


// Read-only health checks + explicitly triggered diagnostics for Alfiya.
// Public browser requests use the existing project publishable/anon key.
// Never return service-role credentials or the Telegram bot token.
const DIAGNOSTIC_VERSION = 'alfiya-diagnostics-v2'
const DIAGNOSTIC_CHAT = '-1004473831246'
const DIAGNOSTIC_THREAD = 5
const DIAGNOSTIC_PROBE = /^__alfiya_diag__\d{13}_[a-z0-9]{6}$/
const safeError = (error: unknown) => txt(error instanceof Error ? error.message : error)
  .replace(/bot\d+:[A-Za-z0-9_-]+/g,'bot[hidden]').slice(0, 240)

async function botApi(method: string, query: Record<string,string> = {}) {
  if (!BOT) return {ok:false,error:'TELEGRAM_BOT_TOKEN not configured'}
  const qs = new URLSearchParams(query).toString()
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT}/${method}${qs ? `?${qs}` : ''}`)
    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload?.ok) return {ok:false,error:safeError(payload?.description || `Telegram HTTP ${response.status}`)}
    return {ok:true,data:payload.result}
  } catch (e) { return {ok:false,error:safeError(e)} }
}

async function diagnosticsHealth() {
  if (!admin) return result({ok:false,error:'Supabase service client is not configured'},503)
  const database: Record<string, unknown> = {ok:false}
  const recipientInfo: Record<string, unknown> = {ok:false}
  const telegram: Record<string, unknown> = {bot:{ok:false,error:'Not checked'},chat:{ok:false,error:'Not checked'}}
  const reportLog: Record<string, unknown> = {ok:false}
  const notificationLog: Record<string, unknown> = {ok:false}
  try {
    const {count,error} = await admin.from('homework_progress').select('lesson_id',{count:'exact',head:true})
      .eq('student_id',STUDENT_ID).not('lesson_id','like','__alfiya_diag__%')
    if (error) throw error
    const {data:hw,error:hwError} = await admin.from('homework_progress')
      .select('lesson_id,status').eq('student_id',STUDENT_ID).not('lesson_id','like','__alfiya_diag__%').limit(100)
    if (hwError) throw hwError
    database.ok=true
    database.homeworkRows=count||0
    database.suspiciousHomework=(hw||[]).filter((r:any) => !['draft','checked','submitted','submitted_pending_report'].includes(r.status)).map((r:any)=>r.lesson_id).slice(0,10)
  } catch(e) { database.error=safeError(e) }
  const {error:grammarColumnError} = await admin.from('grammar_progress').select('answers').eq('student_id',STUDENT_ID).limit(1)
  database.grammarAnswersColumnOk=!grammarColumnError
  if (grammarColumnError) database.grammarAnswersColumnError='grammar_progress.answers is missing or not accessible'
  try {
    const rec = await recipient()
    recipientInfo.ok=true
    recipientInfo.enabled=Boolean(rec.enabled)
    recipientInfo.chatId=txt(rec.chat_id)
    recipientInfo.threadId=rec.message_thread_id === null ? null : Number(rec.message_thread_id)
    const chat=await botApi('getChat',{chat_id:txt(rec.chat_id)})
    telegram.chat=chat.ok?{ok:true,type:txt(chat.data?.type)}:{ok:false,error:chat.error}
  } catch(e) {recipientInfo.error=safeError(e)}
  const bot=await botApi('getMe')
  telegram.bot=bot.ok?{ok:true,username:txt(bot.data?.username)}:{ok:false,error:bot.error}
  try {
    const {data,error}=await admin.from('alfiya_homework_deliveries')
      .select('lesson_id,status').eq('student_id',STUDENT_ID).in('status',['pending','failed']).limit(15)
    if (error) throw error
    reportLog.ok=true
    reportLog.pendingOrFailed=(data||[]).map((r:any)=>({lessonId:r.lesson_id,status:r.status}))
  } catch(e) {reportLog.error='Delivery log unavailable: '+safeError(e)}
  try {
    const {data,error}=await admin.from('material_publications')
      .select('status').eq('student_id',STUDENT_ID).eq('material_type','lesson_bundle').limit(100)
    if (error) throw error
    notificationLog.ok=true
    notificationLog.failedCount=(data||[]).filter((r:any)=>r.status==='failed').length
  }catch(e){notificationLog.error='Publication log unavailable: '+safeError(e)}
  return result({ok:true,studentId:STUDENT_ID,diagnosticVersion:DIAGNOSTIC_VERSION,
    database,recipient:recipientInfo,telegram,reportLog,notificationLog})
}

async function diagnosticsVerifyProbe(lessonId:string) {
  if (!admin || !DIAGNOSTIC_PROBE.test(lessonId)) return result({ok:false,error:'Invalid diagnostic probe'},400)
  const {data,error}=await admin.from('homework_progress').select('lesson_id,status')
    .eq('student_id',STUDENT_ID).eq('lesson_id',lessonId).maybeSingle()
  if (error) return result({ok:false,error:'Server could not read probe'},500)
  return result({ok:Boolean(data),found:Boolean(data),error:data?undefined:'Probe is not visible to service role'})
}

async function diagnosticsCleanupProbe(lessonId:string) {
  if (!admin || !DIAGNOSTIC_PROBE.test(lessonId)) return result({ok:false,error:'Invalid diagnostic probe'},400)
  const {data,error}=await admin.from('homework_progress').delete().eq('student_id',STUDENT_ID)
    .eq('lesson_id',lessonId).select('lesson_id')
  if (error) return result({ok:false,error:'Could not remove probe: '+safeError(error)},500)
  return result({ok:true,removed:(data||[]).length>0})
}

async function diagnosticsSendReport() {
  if (!admin) return result({ok:false,error:'Supabase service client is not configured'},503)
  let rec:any
  try {rec = await recipient()}catch(e){return result({ok:false,error:safeError(e)},409)}
  if (txt(rec.chat_id)!==DIAGNOSTIC_CHAT || Number(rec.message_thread_id)!==DIAGNOSTIC_THREAD)
    return result({ok:false,error:'Alfiya Telegram chat/thread does not match configured destination'},409)
  const match={student_id:STUDENT_ID,material_type:'diagnostic_check',material_id:'telegram_test',notification_version:1}
  const {data:previous,error:readError}=await admin.from('material_publications')
    .select('status,sent_at,updated_at').eq('student_id',STUDENT_ID)
    .eq('material_type','diagnostic_check').eq('material_id','telegram_test')
    .eq('notification_version',1).maybeSingle()
  if (readError) return result({ok:false,error:'Notification log is not configured'},500)
  const last=previous?.status==='sent'?previous.sent_at:previous?.status==='pending'?previous.updated_at:null
  const elapsed=last?Date.now()-Date.parse(last):Infinity
  if (Number.isFinite(elapsed) && elapsed < 60_000)
    return result({ok:true,skipped:true,retryAfterSeconds:Math.ceil((60_000-elapsed)/1000),threadId:DIAGNOSTIC_THREAD})
  const {error:reserveError}=await admin.from('material_publications').upsert({
    ...match,status:'pending',payload:{type:'diagnostics',studentId:STUDENT_ID},error_message:null,
    updated_at:new Date().toISOString()
  },{onConflict:'student_id,material_type,material_id,notification_version'})
  if (reserveError) return result({ok:false,error:'Could not reserve diagnostic send'},500)
  try {
    const message = '🧪 <b>Alfiya · Telegram test</b>\nDiagnostic notification only.\nNo homework was submitted or changed.'
    const messageId=await sendTelegram(rec,message)
    const {error:logError}=await admin.from('material_publications').update({
      status:'sent',telegram_message_id:messageId,sent_at:new Date().toISOString(),error_message:null
    }).eq('student_id',STUDENT_ID).eq('material_type','diagnostic_check')
      .eq('material_id','telegram_test').eq('notification_version',1)
    if (logError) return result({ok:false,error:'Telegram accepted the message but log update failed',telegramMessageId:messageId},500)
    return result({ok:true,telegramMessageId:messageId,chatId:DIAGNOSTIC_CHAT,threadId:DIAGNOSTIC_THREAD})
  }catch(e){
    await admin.from('material_publications').update({status:'failed',error_message:'Diagnostic send failed'})
      .eq('student_id',STUDENT_ID).eq('material_type','diagnostic_check')
      .eq('material_id','telegram_test').eq('notification_version',1)
    return result({ok:false,error:safeError(e)},502)
  }
}

Deno.serve(async (req:Request) => {
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers})
  if (req.method !== 'POST') return result({ok:false,error:'Use POST'},405)
  let payload: any
  try { payload=await req.json() } catch { return result({ok:false,error:'Invalid JSON'},400) }
  if (payload?.studentId !== STUDENT_ID) return result({ok:false,error:'Invalid student'},403)
  if (payload?.kind === 'diagnostics_health' || payload?.kind === 'diagnostics_verify_probe' ||
      payload?.kind === 'diagnostics_cleanup_probe' || payload?.kind === 'diagnostics_send_report') {
    if (!permittedPublicRequest(req)) return result({ok:false,error:'Unauthorized diagnostics request'},401)
    if (payload.kind === 'diagnostics_send_report' && (!WEBHOOK_SECRET || req.headers.get('x-notify-secret') !== WEBHOOK_SECRET)) return result({ok:false,error:'Teacher diagnostic secret required'},403)
    if (payload.kind === 'diagnostics_health') return await diagnosticsHealth()
    if (payload.kind === 'diagnostics_verify_probe') return await diagnosticsVerifyProbe(txt(payload.lessonId))
    if (payload.kind === 'diagnostics_cleanup_probe') return await diagnosticsCleanupProbe(txt(payload.lessonId))
    if (payload.kind === 'diagnostics_send_report') return await diagnosticsSendReport()
  }
  if (payload?.eventType === 'diagnostics' && permittedPublicRequest(req)) {
    return result({ok:true,studentId:STUDENT_ID,telegramConfigured:Boolean(BOT),recipientCheck:'not_performed'})
  }
  if (payload?.eventType === 'homework_report') {
    if (!permittedPublicRequest(req)) return result({ok:false,error:'Forbidden'},403)
    return await homeworkReport(txt(payload.lessonId))
  }
  if (payload?.materialType === 'lesson_bundle') {
    if (!WEBHOOK_SECRET || req.headers.get('x-notify-secret') !== WEBHOOK_SECRET) {
      return result({ok:false,error:'Forbidden'},403)
    }
    return await materialNotice(payload)
  }
  return result({ok:false,error:'Unsupported event'},400)
})
