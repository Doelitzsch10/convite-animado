-- Rode este script uma vez no Supabase: SQL Editor > New query > Run.
--
-- Segurança: o site usa a chave pública ("anon"). Com as regras abaixo ela
-- só consegue INSERIR confirmações. Ninguém consegue ler, alterar ou apagar
-- a lista pelo site. Quem lê a lista é você, pelo painel do Supabase ou pelo
-- script tools/listar_confirmacoes.py (que usa a chave secreta).

create table if not exists public.confirmacoes (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  convidado   text check (convidado is null or char_length(convidado) <= 60),
  responsavel text not null check (char_length(responsavel) between 1 and 80),
  vai         boolean not null,
  -- nomes de TODAS as pessoas que vão (inclui o responsável); vazio se não vai
  pessoas     text[] not null default '{}' check (cardinality(pessoas) <= 10),
  recado      text check (recado is null or char_length(recado) <= 300)
);

alter table public.confirmacoes enable row level security;

drop policy if exists "anon pode inserir" on public.confirmacoes;
create policy "anon pode inserir"
  on public.confirmacoes
  for insert
  to anon
  with check (true);

-- Sem policy de select/update/delete para "anon": a lista fica privada.
