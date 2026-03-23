-- Messaging / Inbox (Central, Delegados, Productores)
--
-- Creates:
-- - message_threads
-- - message_participants
-- - messages
--
-- Security model:
-- - Only participants of a thread can view it and its messages.
-- - Users can insert messages only as themselves and only into threads they participate in.
-- - Thread creation + adding participants is typically done via backend service role.

-- Extensions
create extension if not exists "uuid-ossp";

-- Threads
create table if not exists public.message_threads (
  id uuid primary key default uuid_generate_v4(),
  subject text,
  created_by uuid not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Participants
create table if not exists public.message_participants (
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  user_id uuid not null,
  role text,
  last_read_at timestamptz,
  created_at timestamptz default now(),
  primary key (thread_id, user_id)
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_user_id uuid not null,
  body text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_message_participants_user_id on public.message_participants(user_id);
create index if not exists idx_messages_thread_id_created_at on public.messages(thread_id, created_at);

-- Updated_at trigger for threads
-- Reuses update_updated_at_column() from main schema if present; otherwise creates it.
do $do$
begin
  if not exists (select 1 from pg_proc where proname = 'update_updated_at_column') then
    create or replace function public.update_updated_at_column()
    returns trigger
    language plpgsql
    as $func$
    begin
      new.updated_at = now();
      return new;
    end;
    $func$;
  end if;
end
$do$;

drop trigger if exists update_message_threads_updated_at on public.message_threads;
create trigger update_message_threads_updated_at
before update on public.message_threads
for each row execute function public.update_updated_at_column();

-- Touch thread updated_at when a message is inserted
create or replace function public.touch_thread_on_message_insert()
returns trigger as $$
begin
  update public.message_threads
    set updated_at = now()
    where id = new.thread_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_thread_on_message_insert on public.messages;
create trigger touch_thread_on_message_insert
after insert on public.messages
for each row execute function public.touch_thread_on_message_insert();

-- RLS
alter table public.message_threads enable row level security;
alter table public.message_participants enable row level security;
alter table public.messages enable row level security;

-- Policies
-- Threads: participants can read
drop policy if exists "Participants can read threads" on public.message_threads;
create policy "Participants can read threads"
  on public.message_threads
  for select
  using (
    exists (
      select 1 from public.message_participants p
      where p.thread_id = message_threads.id
        and p.user_id = auth.uid()
    )
  );

-- Participants: participants can read
drop policy if exists "Participants can read participants" on public.message_participants;
create policy "Participants can read participants"
  on public.message_participants
  for select
  using (
    exists (
      select 1 from public.message_participants p
      where p.thread_id = message_participants.thread_id
        and p.user_id = auth.uid()
    )
  );

-- Participants: user can update own last_read_at
drop policy if exists "Users can update own participant row" on public.message_participants;
create policy "Users can update own participant row"
  on public.message_participants
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Messages: participants can read
drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.message_participants p
      where p.thread_id = messages.thread_id
        and p.user_id = auth.uid()
    )
  );

-- Messages: participants can insert as themselves
drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages
  for insert
  with check (
    sender_user_id = auth.uid()
    and exists (
      select 1 from public.message_participants p
      where p.thread_id = messages.thread_id
        and p.user_id = auth.uid()
    )
  );
