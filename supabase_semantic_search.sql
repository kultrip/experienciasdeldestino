-- Semantic Search Setup (Supabase Postgres)
--
-- What this does:
-- 1) Enables pgvector extension
-- 2) Adds `search_text` and `embedding` columns to `experiences`
-- 3) Creates a vector index
-- 4) Adds an RPC function `match_experiences` used by the backend
--
-- Run this in Supabase SQL Editor.

-- 1) Enable pgvector
create extension if not exists vector;

-- 2) Add columns
alter table if exists public.experiences
  add column if not exists search_text text;

-- Gemini `text-embedding-004` typically outputs 768 dimensions.
alter table if exists public.experiences
  add column if not exists embedding vector(768);

-- 3) Index (choose ONE). HNSW is great if available.
-- If your Supabase pgvector version does not support hnsw, comment it and use ivfflat.
create index if not exists experiences_embedding_hnsw_idx
  on public.experiences
  using hnsw (embedding vector_cosine_ops);

-- Alternative:
-- create index if not exists experiences_embedding_ivfflat_idx
--   on public.experiences
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 4) RPC function for matching
create or replace function public.match_experiences(
  query_embedding vector(768),
  match_count int default 48,
  filter_province text default null,
  filter_category text default null,
  min_price numeric default null,
  max_price numeric default null
)
returns table (
  id uuid,
  title text,
  description text,
  long_description text,
  province text,
  city text,
  category text,
  price text,
  price_numeric numeric,
  price_per_person numeric,
  min_group_size int,
  max_group_size int,
  status text,
  main_image text,
  images jsonb,
  duration text,
  language text,
  included jsonb,
  requirements text,
  cancellation_policy text,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
language sql
stable
as $$
  select
    e.id,
    e.title,
    e.description,
    e.long_description,
    e.province,
    e.city,
    e.category,
    e.price,
    e.price_numeric,
    e.price_per_person,
    e.min_group_size,
    e.max_group_size,
    e.status,
    e.main_image,
    e.images,
    e.duration,
    e.language,
    e.included,
    e.requirements,
    e.cancellation_policy,
    e.metadata,
    e.created_at,
    e.updated_at,
    (1 - (e.embedding <=> query_embedding))::float as similarity
  from public.experiences e
  where e.status = 'published'
    and e.embedding is not null
    and (filter_province is null or e.province = filter_province)
    and (filter_category is null or e.category = filter_category)
    and (min_price is null or coalesce(e.price_numeric, e.price_per_person, 0) >= min_price)
    and (max_price is null or coalesce(e.price_numeric, e.price_per_person, 0) <= max_price)
  order by e.embedding <=> query_embedding
  limit match_count;
$$;
