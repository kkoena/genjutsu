-- Run once in Supabase: SQL Editor > New query > paste > Run
create extension if not exists pg_trgm;

create table titles (
  id serial primary key,
  name text not null, native_name text, genre text, studio text,
  tsv tsvector generated always as (
    to_tsvector('simple', coalesce(name,'')||' '||coalesce(native_name,'')||' '||coalesce(genre,'')||' '||coalesce(studio,''))
  ) stored
);
create index titles_tsv on titles using gin (tsv);
create index titles_trgm on titles using gin (name gin_trgm_ops);

create table regional_demand (
  title_id int references titles(id) on delete cascade,
  region text not null,
  demand int check (demand between 0 and 100),
  piracy_signal int check (piracy_signal between 0 and 100),
  primary key (title_id, region)
);
create table search_log (id bigserial primary key, q text, region text, at timestamptz default now());

-- Lock tables from the public anon key; the API uses the service key, which bypasses RLS.
alter table titles enable row level security;
alter table regional_demand enable row level security;
alter table search_log enable row level security;

-- Google-style ranking: full-text rank + typo-tolerant similarity + Indian demand.
create or replace function search_titles(q text, reg text default null, lim int default 10)
returns table (id int, name text, native_name text, genre text, studio text, demand int, piracy_signal int, score real)
language sql stable as $$
  select t.id, t.name, t.native_name, t.genre, t.studio,
         round(avg(d.demand))::int, round(avg(d.piracy_signal))::int,
         (ts_rank(t.tsv, websearch_to_tsquery('simple', q)) * 2 + similarity(t.name, q) + avg(d.demand) / 200.0)::real
  from titles t
  join regional_demand d on d.title_id = t.id and (reg is null or d.region = reg)
  where t.tsv @@ websearch_to_tsquery('simple', q) or t.name % q or t.name ilike q || '%'
  group by t.id
  order by 8 desc
  limit lim
$$;

create or replace function trending(lim int default 8)
returns table (q text, n bigint) language sql stable as $$
  select lower(q), count(*) from search_log
  where at > now() - interval '7 days' group by 1 order by 2 desc limit lim
$$;

-- Seed data. Demand numbers are random placeholders: replace with Demand Radar output.
insert into titles (name, native_name, genre, studio) values
('Naruto','ナルト','Shonen','Pierrot'),('One Piece','ワンピース','Shonen','Toei Animation'),
('Demon Slayer','鬼滅の刃','Shonen','ufotable'),('Jujutsu Kaisen','呪術廻戦','Shonen','MAPPA'),
('Attack on Titan','進撃の巨人','Action','WIT / MAPPA'),('Death Note','デスノート','Thriller','Madhouse'),
('Dragon Ball Z','ドラゴンボールZ','Shonen','Toei Animation'),('Spy x Family','スパイファミリー','Comedy','Wit / CloverWorks'),
('Chainsaw Man','チェンソーマン','Horror','MAPPA'),('Fullmetal Alchemist','鋼の錬金術師','Adventure','Bones'),
('My Hero Academia','僕のヒーローアカデミア','Shonen','Bones'),('Spirited Away','千と千尋の神隠し','Fantasy','Studio Ghibli'),
('Haikyu!!','ハイキュー!!','Sports','Production I.G');

insert into regional_demand
select t.id, r, (30 + random()*65)::int, (20 + random()*75)::int
from titles t cross join unnest(array['North','South','West','East','North-East']) r;
