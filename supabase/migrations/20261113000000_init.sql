-- =========================================================
-- Sahih mi? — veritabanı şeması
-- Supabase > SQL Editor'e yapıştırıp tek seferde çalıştırın.
-- =========================================================

create extension if not exists pg_trgm;

-- ---------- Türkçe normalize (arama için) ----------
-- "İ, ı, ş, ğ, ü, ö, ç, â" gibi harfleri sadeleştirip küçültür.
-- Böylece "cennet anaların" ile "Cennet ANALARIN" aynı bulunur.
create or replace function public.tr_normalize(t text)
returns text
language sql
immutable
parallel safe
as $$
  select lower(
    translate(
      coalesce(t, ''),
      'İIıŞşĞğÜüÖöÇçÂâÎîÛû’''".,;:!?()[]«»-',
      'iiissgguuooccaaiiuu                '
    )
  );
$$;

-- ---------- Enum'lar ----------
do $$ begin
  create type public.hadis_derece as enum ('sahih', 'hasen', 'zayif', 'uydurma');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.uygulama_rol as enum ('admin', 'alim');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.soru_durum as enum ('bekliyor', 'cevaplandi', 'reddedildi');
exception when duplicate_object then null; end $$;

-- ---------- Roller ----------
create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.uygulama_rol not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create or replace function public.has_role(_role public.uygulama_rol)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = _role
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'alim')
  );
$$;

-- ---------- Âlimler ----------
create table if not exists public.alimler (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  ad text not null,
  unvan text,
  biyografi text,
  foto_url text,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Konular ----------
create table if not exists public.konular (
  id uuid primary key default gen_random_uuid(),
  ad text not null unique,
  slug text not null unique,
  ikon text,
  sira int not null default 0
);

-- ---------- Hadisler ----------
create table if not exists public.hadisler (
  id uuid primary key default gen_random_uuid(),
  metin text not null,                       -- Türkçe metin (doğru hâli)
  yaygin_versiyon text,                      -- Sosyal medyada dolaşan hâli
  arapca_metin text,
  derece public.hadis_derece not null,
  kaynaklar jsonb not null default '[]'::jsonb,  -- [{ "kitap": "Buhârî", "bolum": "İlim", "numara": "39" }]
  aciklama text,                             -- Âlimin değerlendirmesi
  konu_id uuid references public.konular(id) on delete set null,
  alim_id uuid references public.alimler(id) on delete set null,
  yayinda boolean not null default false,
  okunma int not null default 0,
  arama text generated always as (
    public.tr_normalize(metin || ' ' || coalesce(yaygin_versiyon, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hadisler_arama_trgm on public.hadisler using gin (arama gin_trgm_ops);
create index if not exists hadisler_konu_idx on public.hadisler (konu_id);
create index if not exists hadisler_yayinda_idx on public.hadisler (yayinda, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists hadisler_touch on public.hadisler;
create trigger hadisler_touch before update on public.hadisler
for each row execute function public.touch_updated_at();

-- ---------- Kullanıcı soruları ("Bunu gördüm, doğru mu?") ----------
create table if not exists public.kullanici_sorulari (
  id uuid primary key default gen_random_uuid(),
  metin text not null check (char_length(metin) between 10 and 2000),
  nerede_gordu text check (char_length(nerede_gordu) <= 200),
  durum public.soru_durum not null default 'bekliyor',
  hadis_id uuid references public.hadisler(id) on delete set null,
  cevap_notu text check (char_length(cevap_notu) <= 1000),   -- reddedilirse kısa açıklama
  created_at timestamptz not null default now()
);

create index if not exists sorular_durum_idx on public.kullanici_sorulari (durum, created_at desc);

-- =========================================================
-- RLS
-- =========================================================
alter table public.user_roles enable row level security;
alter table public.alimler enable row level security;
alter table public.konular enable row level security;
alter table public.hadisler enable row level security;
alter table public.kullanici_sorulari enable row level security;

-- user_roles: herkes sadece kendi rolünü görür, yönetimi admin yapar
drop policy if exists "rol_kendi" on public.user_roles;
create policy "rol_kendi" on public.user_roles for select
  using (user_id = auth.uid() or public.has_role('admin'));
drop policy if exists "rol_admin" on public.user_roles;
create policy "rol_admin" on public.user_roles for all
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- alimler
drop policy if exists "alim_oku" on public.alimler;
create policy "alim_oku" on public.alimler for select
  using (aktif or public.is_staff());
drop policy if exists "alim_admin" on public.alimler;
create policy "alim_admin" on public.alimler for all
  using (public.has_role('admin')) with check (public.has_role('admin'));
drop policy if exists "alim_kendi_guncelle" on public.alimler;
create policy "alim_kendi_guncelle" on public.alimler for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- konular
drop policy if exists "konu_oku" on public.konular;
create policy "konu_oku" on public.konular for select using (true);
drop policy if exists "konu_admin" on public.konular;
create policy "konu_admin" on public.konular for all
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- hadisler
drop policy if exists "hadis_oku" on public.hadisler;
create policy "hadis_oku" on public.hadisler for select
  using (yayinda or public.is_staff());
drop policy if exists "hadis_ekle" on public.hadisler;
create policy "hadis_ekle" on public.hadisler for insert
  with check (public.is_staff());
drop policy if exists "hadis_guncelle" on public.hadisler;
create policy "hadis_guncelle" on public.hadisler for update
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "hadis_sil" on public.hadisler;
create policy "hadis_sil" on public.hadisler for delete
  using (public.has_role('admin'));

-- kullanici_sorulari: herkes (hesapsız) gönderebilir, sadece ekip okur
drop policy if exists "soru_gonder" on public.kullanici_sorulari;
create policy "soru_gonder" on public.kullanici_sorulari for insert
  to anon, authenticated
  with check (durum = 'bekliyor' and hadis_id is null);
drop policy if exists "soru_ekip" on public.kullanici_sorulari;
create policy "soru_ekip" on public.kullanici_sorulari for select
  using (public.is_staff());
drop policy if exists "soru_ekip_guncelle" on public.kullanici_sorulari;
create policy "soru_ekip_guncelle" on public.kullanici_sorulari for update
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "soru_admin_sil" on public.kullanici_sorulari;
create policy "soru_admin_sil" on public.kullanici_sorulari for delete
  using (public.has_role('admin'));

-- =========================================================
-- RPC fonksiyonları
-- =========================================================

-- Bulanık hadis araması (yazım hatalarını tolere eder)
create or replace function public.hadis_ara(
  q text,
  _konu uuid default null,
  _derece public.hadis_derece default null,
  _limit int default 30
)
returns setof public.hadisler
language sql
stable
security invoker
set search_path = public
as $$
  with n as (select public.tr_normalize(q) as nq)
  select h.*
  from public.hadisler h, n
  where h.yayinda
    and (_konu is null or h.konu_id = _konu)
    and (_derece is null or h.derece = _derece)
    and (
      coalesce(trim(n.nq), '') = ''
      or h.arama like '%' || n.nq || '%'
      or n.nq <% h.arama
    )
  order by
    case when coalesce(trim(n.nq), '') = '' then 0
         else greatest(word_similarity(n.nq, h.arama), similarity(n.nq, h.arama)) end desc,
    h.okunma desc,
    h.created_at desc
  limit least(greatest(_limit, 1), 100);
$$;

-- Okunma sayacı (hesapsız kullanıcı da artırabilir)
create or replace function public.hadis_okundu(_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.hadisler set okunma = okunma + 1 where id = _id and yayinda;
$$;

-- Kullanıcı gönderdiği soruların durumunu görür (ID'leri cihazında saklar)
create or replace function public.soru_durumlari(_ids uuid[])
returns table (id uuid, durum public.soru_durum, hadis_id uuid, cevap_notu text, metin text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.durum, s.hadis_id, s.cevap_notu, s.metin, s.created_at
  from public.kullanici_sorulari s
  where s.id = any(_ids[1:50]);
$$;

grant execute on function public.hadis_ara(text, uuid, public.hadis_derece, int) to anon, authenticated;
grant execute on function public.hadis_okundu(uuid) to anon, authenticated;
grant execute on function public.soru_durumlari(uuid[]) to anon, authenticated;

-- =========================================================
-- Başlangıç konuları
-- =========================================================
insert into public.konular (ad, slug, ikon, sira) values
  ('İman ve Akaid', 'iman', '🕋', 1),
  ('Namaz', 'namaz', '🕌', 2),
  ('Oruç ve Ramazan', 'oruc', '🌙', 3),
  ('Zekât ve Sadaka', 'zekat', '🤲', 4),
  ('Hac ve Umre', 'hac', '🧭', 5),
  ('Aile ve Anne-Baba', 'aile', '👨‍👩‍👧', 6),
  ('Ahlâk ve Adab', 'ahlak', '🌿', 7),
  ('İlim', 'ilim', '📖', 8),
  ('Kıyamet ve Ahiret', 'ahiret', '⏳', 9),
  ('Faziletler (Gün, Ay, Sure)', 'faziletler', '✨', 10),
  ('Dua ve Zikir', 'dua', '📿', 11),
  ('Sağlık ve Yemek', 'saglik', '🍯', 12),
  ('Diğer', 'diger', '📌', 99)
on conflict (slug) do nothing;

-- =========================================================
-- Admin: e-postası verilen kullanıcıyı âlim olarak yetkilendir
-- (Kullanıcıyı önce Supabase > Authentication > Add user ile oluşturun.)
-- =========================================================
create or replace function public.alim_yetkilendir(_email text, _alim_id uuid, _admin boolean default false)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  _uid uuid;
begin
  if not public.has_role('admin') then
    raise exception 'Yetkiniz yok';
  end if;

  select id into _uid from auth.users where lower(email) = lower(trim(_email)) limit 1;
  if _uid is null then
    return 'Bu e-postayla kayıtlı kullanıcı yok. Önce Supabase > Authentication > Add user ile oluşturun.';
  end if;

  update public.alimler set user_id = null where user_id = _uid and id <> _alim_id;
  update public.alimler set user_id = _uid where id = _alim_id;
  insert into public.user_roles (user_id, role) values (_uid, 'alim') on conflict do nothing;
  if _admin then
    insert into public.user_roles (user_id, role) values (_uid, 'admin') on conflict do nothing;
  end if;
  return 'ok';
end $$;

revoke execute on function public.alim_yetkilendir(text, uuid, boolean) from public, anon;
grant execute on function public.alim_yetkilendir(text, uuid, boolean) to authenticated;
