-- Rode este script no SQL Editor do seu projeto Supabase (Supabase Dashboard > SQL Editor > New query)

create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table kv_store enable row level security;

-- Acesso público de leitura/escrita, pensado para um bolão entre amigos
-- (grupo pequeno e de confiança). Não use este esquema para dados sensíveis.
create policy "Public read" on kv_store
  for select using (true);

create policy "Public insert" on kv_store
  for insert with check (true);

create policy "Public update" on kv_store
  for update using (true);

create policy "Public delete" on kv_store
  for delete using (true);
