-- Datable: rubrique « Ressources & Conseils » (articles).
--
-- Sécurité :
--  * RLS activée. Une seule politique : lecture publique des articles PUBLIÉS.
--    Les brouillons ne sont jamais lisibles avec la clé publique (anon).
--  * Aucune politique d'écriture : toute création / modification / publication passe par la
--    backend function `admin-articles` (rôle service), protégée par la session admin existante.
--  * Les droits d'écriture sont aussi retirés explicitement aux rôles anon / authenticated.

create table if not exists public.datable_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  lang text not null default 'fr',
  status text not null default 'draft',
  category text not null,
  icon text,
  title text not null,
  excerpt text not null default '',
  seo_title text,
  seo_description text,
  author_name text not null default 'Maverick Bouillot',
  author_role text,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  reading_minutes integer not null default 1,
  translation_of uuid references public.datable_articles (id) on delete set null,
  published_at timestamptz,
  modified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint datable_articles_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  constraint datable_articles_lang_check check (lang in ('fr', 'en')),
  constraint datable_articles_status_check check (status in ('draft', 'published')),
  constraint datable_articles_category_check check (
    category in ('rentabilite', 'pilotage', 'data-ia', 'menu-engineering', 'cas-clients', 'conseils')
  ),
  constraint datable_articles_published_has_date check (status <> 'published' or published_at is not null),
  constraint datable_articles_not_self_translation check (translation_of is null or translation_of <> id)
);

create unique index if not exists datable_articles_slug_unique_idx
  on public.datable_articles (slug);

-- Une traduction ne peut cibler qu'un seul article d'origine à la fois.
create unique index if not exists datable_articles_translation_of_unique_idx
  on public.datable_articles (translation_of)
  where translation_of is not null;

create index if not exists datable_articles_published_idx
  on public.datable_articles (published_at desc)
  where status = 'published';

alter table public.datable_articles enable row level security;

drop policy if exists "Public can read published articles" on public.datable_articles;
create policy "Public can read published articles"
  on public.datable_articles
  for select
  to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

revoke insert, update, delete, truncate on public.datable_articles from anon, authenticated;
