-- ============================================
-- 叮当讲故事 - 数据库建表脚本
-- 所有表使用 dingdang_study_ 前缀
-- ============================================

-- 1. 用户资料表
create table if not exists dingdang_study_profiles (
  id uuid references auth.users on delete cascade primary key,
  phone text,
  name text not null default '宝贝',
  age int not null default 5,
  avatar_url text,
  red_flowers int not null default 0,
  course_offset int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 创建更新时间触发器
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_dingdang_study_profiles_updated_at
  before update on dingdang_study_profiles
  for each row execute function update_updated_at_column();

-- RLS 策略
alter table dingdang_study_profiles enable row level security;

create policy "Users can view own profile"
  on dingdang_study_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on dingdang_study_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on dingdang_study_profiles for update
  using (auth.uid() = id);

-- 新用户自动创建 profile
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.dingdang_study_profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- 2. 成长日记表
create table if not exists dingdang_study_diaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references dingdang_study_profiles(id) on delete cascade not null,
  date date not null,
  content text not null,
  photos text[] default '{}',
  is_draft boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists dingdang_study_diaries_user_id_idx
  on dingdang_study_diaries(user_id);
create index if not exists dingdang_study_diaries_date_idx
  on dingdang_study_diaries(date desc);

create trigger update_dingdang_study_diaries_updated_at
  before update on dingdang_study_diaries
  for each row execute function update_updated_at_column();

alter table dingdang_study_diaries enable row level security;

create policy "Users can CRUD own diaries"
  on dingdang_study_diaries for all
  using (auth.uid() = user_id);


-- 3. 课程内容表 (公共)
create table if not exists dingdang_study_courses (
  id text primary key,
  category text not null,
  title text not null,
  text text not null,
  pinyin text not null,
  sort_order int not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists dingdang_study_courses_category_idx
  on dingdang_study_courses(category);
create index if not exists dingdang_study_courses_sort_idx
  on dingdang_study_courses(sort_order);

alter table dingdang_study_courses enable row level security;

-- 所有人可读
create policy "Anyone can read courses"
  on dingdang_study_courses for select
  using (true);


-- 4. 课程配图缓存表
create table if not exists dingdang_study_course_images (
  id uuid primary key default gen_random_uuid(),
  course_id text references dingdang_study_courses(id) not null unique,
  image_url text not null,
  generated_at timestamptz default now()
);

alter table dingdang_study_course_images enable row level security;

create policy "Anyone can read course images"
  on dingdang_study_course_images for select
  using (true);

create policy "Authenticated can insert course images"
  on dingdang_study_course_images for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated can update course images"
  on dingdang_study_course_images for update
  using (auth.role() = 'authenticated');


-- 5. 自定义内容表
create table if not exists dingdang_study_custom_contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references dingdang_study_profiles(id) on delete cascade not null,
  title text not null,
  text text not null,
  pinyin text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists dingdang_study_custom_contents_user_id_idx
  on dingdang_study_custom_contents(user_id);

alter table dingdang_study_custom_contents enable row level security;

create policy "Users can CRUD own custom contents"
  on dingdang_study_custom_contents for all
  using (auth.uid() = user_id);


-- 6. 学习记录表
create table if not exists dingdang_study_learning_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references dingdang_study_profiles(id) on delete cascade not null,
  course_id text not null,
  learned_at timestamptz default now(),

  unique(user_id, course_id)
);

create index if not exists dingdang_study_learning_records_user_id_idx
  on dingdang_study_learning_records(user_id);

alter table dingdang_study_learning_records enable row level security;

create policy "Users can CRUD own learning records"
  on dingdang_study_learning_records for all
  using (auth.uid() = user_id);


-- ============================================
-- Storage Buckets (需要在 Storage 页面手动创建或使用下面的SQL)
-- ============================================

-- 日记图片 bucket (私有)
insert into storage.buckets (id, name, public)
values ('dingdang-diary-photos', 'dingdang-diary-photos', false)
on conflict (id) do nothing;

-- 课程配图 bucket (公开)
insert into storage.buckets (id, name, public)
values ('dingdang-course-images', 'dingdang-course-images', true)
on conflict (id) do nothing;

-- Storage RLS policies
create policy "Users can upload own diary photos"
  on storage.objects for insert
  with check (
    bucket_id = 'dingdang-diary-photos'
    and auth.role() = 'authenticated'
  );

create policy "Users can view own diary photos"
  on storage.objects for select
  using (
    bucket_id = 'dingdang-diary-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own diary photos"
  on storage.objects for delete
  using (
    bucket_id = 'dingdang-diary-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Anyone can view course images"
  on storage.objects for select
  using (bucket_id = 'dingdang-course-images');

create policy "Authenticated can upload course images"
  on storage.objects for insert
  with check (
    bucket_id = 'dingdang-course-images'
    and auth.role() = 'authenticated'
  );


-- ============================================
-- 完成提示
-- ============================================
-- 执行完成后，请检查:
-- 1. Tables 页面应该有 6 个 dingdang_study_ 开头的表
-- 2. Storage 页面应该有 2 个 bucket
-- 3. 接下来需要导入课程数据
