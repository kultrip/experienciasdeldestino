-- Reviews table for experiences
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  experience_id uuid references experiences(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now()
);

alter table reviews enable row level security;

create policy "Reviews are readable by anyone"
  on reviews for select
  using (true);

create policy "Authenticated users can add reviews"
  on reviews for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update own reviews"
  on reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on reviews for delete
  using (auth.uid() = user_id);
