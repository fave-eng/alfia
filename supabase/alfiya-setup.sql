-- ALFIYA ONLY: additions to the EXISTING shared Supabase project.
-- Run on the project shown in Alfiya/config.js, not on a different project.
-- Does not delete existing student progress or modify Kristina's recipient.

-- Store grammar response values as well as scores, across devices.
alter table public.grammar_progress
  add column if not exists answers jsonb not null default '{}'::jsonb;

-- Store per-student Telegram topic IDs, not a hardcoded topic.
alter table public.telegram_recipients
  add column if not exists message_thread_id bigint;

-- Chat ID was UNIQUE in Kristina's original schema. Allow each learner
-- to have their own forum topic within the same group.
-- See set-alfiya-telegram-topic.sql for the exact repeatable setup and actual ID.

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

-- Telegram target has been supplied:
--   https://t.me/c/4473831246/5
--   chat_id = -1004473831246, presumed message_thread_id = 5
-- Run set-alfiya-telegram-topic.sql separately to register it. Do not modify
-- other students' destination records.

-- Confirm existing project tables and rows are ready (read-only):
select table_name from information_schema.tables
where table_schema='public'
  and table_name in ('homework_progress','vocabulary_progress',
    'vocabulary_topic_progress','grammar_progress','telegram_recipients','material_publications');
