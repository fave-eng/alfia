# Alfiya · English Space · Speakout A1 (3rd Edition)

## Start state: EMPTY

This is a clean, individual student website for **Альфия (Alfiya)**. It has **no homework assignments, vocabulary words, grammar topics, knowledge-base articles, audio, pictures or example answers**. No student progress data is packaged in the ZIP archive.

On first opening, the website displays zero everywhere:
- Homework: **0 of 0**
- Vocabulary: **0 words, 0 topics**
- Grammar: **0 of 0**
- Knowledge Base: empty-state screen

The site retains its layout, interactive exercise engine, local progress saving, and configuration for Supabase and Telegram. The first real homework will be `data/lessons/lesson-1.json` once you create it. There is currently **no** `lesson-1.json` or `lesson-2.json` — on purpose.

### Main files

- `index.html` — home, progress dashboard
- `homework.html`, `lesson.html` — homework list and interactive assignment pages
- `vocabulary-hub.html`, `vocabulary.html` — vocabulary hub and cards
- `grammar.html`, `grammar-topic.html` — grammar list and explanations
- `knowledge-base.html` — currently empty, ready for future lesson notes
- `data/lessons/` — empty; add `lesson-1.json` to publish the first assignment
- `data/vocabulary-data.js` — `window.VOCABULARY_DATA = [];` (no words)
- `data/grammar-data.js` — `window.GRAMMAR_DATA = [];` (no topics)
- `config.js` — `student.id = alfiya`, level A1, Speakout 3rd Edition
- `diagnostics.html` — service diagnostics (read-only)

### Adding new lessons later

1. Create `data/lessons/lesson-1.json` with id `lesson-1`, `number: 1`, `status: "available"` and interactive `blocks`. If not ready, set `status: "draft"`.
2. Add a vocabulary topic to `window.VOCABULARY_DATA` only after you have selected the vocabulary from the lesson. Connect it using `vocabularyId` and `linkedLessonId`.
3. Add grammar topics to `window.GRAMMAR_DATA` only after the topic has been taught. Connect using `grammarIds` and `linkedLessonId`.
4. Add lesson notes to `knowledge-base.html` when you have real content. There is no prefabricated syllabus or content in these three sections.
5. If Telegram notifications are configured, you can set `notification.enabled=true` for a published lesson and run the corresponding GitHub Action with `lesson_id=lesson-1`.

The site searches sequential `lesson-N.json` files starting at `lesson-1.json`. Do not skip numbers at the beginning of the sequence.

### Preview / publication

Upload the whole `Alfiya` folder to a **separate** GitHub repository for the student, or serve it on a static host. When previewing locally, run `python3 -m http.server 8000` in the site folder; open `http://localhost:8000/` (not an HTML `file://` URL).

### Supabase and Telegram — IMPORTANT

`config.js` contains a **public anon key** and Supabase URL originally copied from the user-provided Kristina project. This setup is **not verified** against the actual student's database. All local progress keys use the unique student ID `alfiya`. No previous student's data has been copied into the ZIP, and no external Supabase rows have been deleted or modified.

If any progress already exists remotely for `student_id='alfiya'`, it may be restored when the site connects. **A clean ZIP is not a remote database reset.** Confirm actual records in Supabase before using the site, and remove only the records for this student if you intentionally want to reset them. Do not use broad SQL deletions.

The included file `supabase/alfiya-setup.sql` contains optional schema changes for grammar answer storage, Telegram topics, and notification delivery logging, but it does not run automatically. Before using cloud sync check the existence and row-level security of `homework_progress`, `vocabulary_progress`, `vocabulary_topic_progress`, and `grammar_progress`. `student_id` alone is not authentication or private access control.

### Telegram destination for Alfiya

You supplied this link: **https://t.me/c/4473831246/5**. It maps to the Telegram supergroup **chat_id `-1004473831246`**. For a forum-topic link, **`message_thread_id = 5`**; this assumes the link points to the topic starter, rather than an unrelated individual message. Confirm that it opens the intended topic before enabling delivery.

**To activate notifications:**
1. Open your existing Supabase project (the one used in `config.js`). Run `supabase/set-alfiya-telegram-topic.sql` in **SQL Editor**. This saves the destination for **student_id `alfiya`**; it does not overwrite Kristina's row. The SQL also adapts the old chat-ID uniqueness constraint for multiple student topics in one group.
2. If the base tables and delivery log have not been created, first review/apply `supabase/alfiya-setup.sql`. It expects the existing shared student progress and Telegram tables.
3. Confirm the Telegram bot is a member of that supergroup and can post to the intended topic. Store `TELEGRAM_BOT_TOKEN` and `NOTIFY_WEBHOOK_SECRET` as **Supabase secrets** (not in the public site). Deploy the separate `notify-alfiya-telegram` Edge Function using the supplied GitHub Actions setup workflow or Supabase CLI.
4. To receive **submitted-homework reports**, the live site must save progress successfully in Supabase and invoke the function. To receive **new-material alerts**, supply the GitHub Actions repository variables/secrets described below and run `2 - Notify about new materials` for a published lesson with `notification.enabled = true`.
5. Send a controlled test after deployment and check that it appears in the correct Telegram topic, not in the general chat. The ZIP does **not** send any messages by itself.

Repository Actions variables: `SUPABASE_PROJECT_ID`, `STUDENT_ID=alfiya`, `SITE_BASE_URL` and `TELEGRAM_NOTIFICATIONS_ENABLED=true`; secrets: `SUPABASE_ACCESS_TOKEN`, `TELEGRAM_BOT_TOKEN` and `NOTIFY_WEBHOOK_SECRET`. Do not publish secret values.

`diagnostics.html` checks connectivity but does **not** send Telegram messages. Avoid sending tests with real submitted-homework payloads if you do not want them recorded as delivered.

### Audio filenames (Speakout A1 workbook)

The teacher's example is **`SO3_A1_WB_1A_Audio_1_01.mp3`**. Place that file unchanged in `Alfiya/audio/` when a lesson needs it. Reference it exactly as `"audio": "audio/SO3_A1_WB_1A_Audio_1_01.mp3"` in the future homework JSON. There is currently **no audio** in the ZIP; no lesson has been published and no placeholder exercise has been added. See `audio/README.txt`.

Do not put Telegram bot tokens or Supabase service-role keys into publicly accessible files.

### Validation scope

ZIP integrity, empty curriculum arrays, absence of homework JSON files, internal links and JavaScript syntax can be checked locally. The real Supabase database, live Telegram delivery, and hosted GitHub Pages deployment are **not** confirmed by packaging.
