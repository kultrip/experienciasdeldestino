-- FIX: Messaging RLS Policies (infinite recursion fix)
-- 
-- The original policies caused "infinite recursion detected" because
-- the policy on message_participants referenced itself in a subquery.
--
-- Solution: Use simpler direct checks without self-referencing subqueries.

-- Drop existing problematic policies
drop policy if exists "Participants can read participants" on public.message_participants;
drop policy if exists "Participants can read threads" on public.message_threads;
drop policy if exists "Participants can read messages" on public.messages;
drop policy if exists "Participants can send messages" on public.messages;
drop policy if exists "Users can update own participant row" on public.message_participants;

-- FIXED: Participants can read their own participation records directly
-- (No self-reference - just check if the row belongs to current user)
create policy "Participants can read own participations"
  on public.message_participants
  for select
  using (user_id = auth.uid());

-- Participants: user can update own last_read_at
create policy "Users can update own participant row"
  on public.message_participants
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- FIXED: Threads - participants can read threads they belong to
-- Now uses a direct join approach that doesn't cause recursion
create policy "Participants can read threads"
  on public.message_threads
  for select
  using (
    id in (
      select thread_id from public.message_participants
      where user_id = auth.uid()
    )
  );

-- FIXED: Messages - participants can read messages from threads they belong to
create policy "Participants can read messages"
  on public.messages
  for select
  using (
    thread_id in (
      select thread_id from public.message_participants
      where user_id = auth.uid()
    )
  );

-- Messages: participants can send messages to threads they belong to
create policy "Participants can send messages"
  on public.messages
  for insert
  with check (
    sender_user_id = auth.uid()
    and thread_id in (
      select thread_id from public.message_participants
      where user_id = auth.uid()
    )
  );
