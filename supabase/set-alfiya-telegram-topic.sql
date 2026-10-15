-- ALFIYA ONLY: Telegram destination supplied by the teacher on 2026-10-15.
-- https://t.me/c/4473831246/5
-- Telegram supergroup chat_id = -1004473831246; presumed forum topic ID = 5.
-- Run in Supabase Dashboard -> SQL Editor on the project linked in config.js.
-- This does not send a test message and does not deploy an Edge Function.
-- Run only if public.telegram_recipients already exists.

begin;

-- Multiple students may use different topics in the same Telegram supergroup.
alter table public.telegram_recipients
  add column if not exists message_thread_id bigint;

-- Kristina's original schema required globally unique chat_id, which would
-- prevent two student topics in the same group. Student ID stays unique.
alter table public.telegram_recipients
  drop constraint if exists telegram_recipients_chat_id_key;

-- Prevent two students from using exactly the same chat + topic address.
create unique index if not exists telegram_recipients_chat_topic_unique
  on public.telegram_recipients (chat_id, coalesce(message_thread_id, 0::bigint));

insert into public.telegram_recipients
  (student_id, chat_id, message_thread_id, enabled)
values
  ('alfiya', -1004473831246, 5, true)
on conflict (student_id) do update
set chat_id = excluded.chat_id,
    message_thread_id = excluded.message_thread_id,
    enabled = true;

commit;

-- This should return one row: alfiya | -1004473831246 | 5 | true
select student_id, chat_id, message_thread_id, enabled
from public.telegram_recipients
where student_id = 'alfiya';
