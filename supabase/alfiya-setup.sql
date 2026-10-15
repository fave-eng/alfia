-- ALFIYA ONLY: additions to the EXISTING shared Supabase project.
-- Run on the project shown in Alfiya/config.js, not on a different project.
-- Does not delete existing student progress or modify Kristina's recipient.

-- Store grammar response values as well as scores, across devices.
alter table public.grammar_progress
  add column if not exists answers jsonb not null default '{}'::jsonb;

-- Store per-student Telegram topic IDs, not a hardcoded topic.
alter table public.telegram_recipients
  add column if not exists message_thread_id bigint;

-- Existing Kristina SQL declared chat_id UNIQUE. If the new student shares the
-- same Telegram supergroup, different students need the same chat_id but
-- different message_thread_id values. Review the constraint before running:
-- alter table public.telegram_recipients
--   drop constraint if exists telegram_recipients_chat_id_key;

create table if not exists public.alfiya_homework_deliveries (
  student_id text not null,
  lesson_id text not null,
  status text not null check (status in ('pending','sent','failed')),
  telegram_message_id bigint,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  primary key(student_id,lesson_id)
);
alter table public.alfiya_homework_deliveries enable row level security;
revoke all on public.alfiya_homework_deliveries from anon, authenticated;
grant all on public.alfiya_homework_deliveries to service_role;

-- Existing material_publications and telegram_recipients tables are used
-- without changing the older student's records. Add recipient manually only
-- after you know the Telegram chat ID and topic ID:
-- insert into public.telegram_recipients
--   (student_id, chat_id, message_thread_id, enabled)
-- values ('alfiya', -1000000000000, 1234, true)
-- on conflict (student_id) do update
-- set chat_id = excluded.chat_id,
--     message_thread_id = excluded.message_thread_id,
--     enabled = excluded.enabled;

-- Confirm existing project tables and rows are ready (read-only):
select table_name from information_schema.tables
where table_schema='public'
  and table_name in ('homework_progress','vocabulary_progress',
    'vocabulary_topic_progress','grammar_progress','telegram_recipients','material_publications');
