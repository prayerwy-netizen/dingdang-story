# 叮当讲故事 - 数据库迁移规划

## 一、项目概述

### 1.1 迁移目标
将现有的 localStorage 本地存储迁移到 Supabase 云端数据库，实现：
- 用户登录/注册（手机号验证码）
- 多设备数据同步
- 图片云端存储
- 课程内容云端管理

### 1.2 技术选型
| 功能 | 技术方案 |
|------|----------|
| 数据库 | Supabase (PostgreSQL) |
| 用户认证 | Supabase Auth (手机号 + 验证码) |
| 文件存储 | Supabase Storage |
| 前端 SDK | @supabase/supabase-js |

---

## 二、数据库架构

### 2.1 ER 图

```
┌─────────────────┐     ┌─────────────────┐
│   auth.users    │     │    profiles     │
│  (Supabase内置) │────▶│   (用户资料)    │
└─────────────────┘     └────────┬────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐      ┌─────────────────┐     ┌──────────────────┐
│    diaries    │      │ custom_contents │     │ learning_records │
│  (成长日记)   │      │  (自定义内容)   │     │   (学习记录)     │
└───────────────┘      └─────────────────┘     └──────────────────┘

┌─────────────────┐     ┌─────────────────┐
│    courses      │     │  course_images  │
│  (课程内容)     │     │  (课程配图)     │
└─────────────────┘     └─────────────────┘
```

### 2.2 表结构详情

#### profiles (用户资料)
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  phone text unique,                    -- 手机号
  name text not null default '宝贝',    -- 孩子昵称
  age int not null default 5,           -- 孩子年龄
  avatar_url text,                      -- 头像URL
  red_flowers int not null default 0,   -- 小红花数量
  course_offset int not null default 0, -- 课程偏移量
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 启用 RLS (行级安全)
alter table profiles enable row level security;

-- 用户只能访问自己的数据
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
```

#### diaries (成长日记)
```sql
create table diaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  content text not null,
  photos text[] default '{}',           -- 图片URL数组
  is_draft boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 索引
create index diaries_user_id_idx on diaries(user_id);
create index diaries_date_idx on diaries(date desc);

-- RLS
alter table diaries enable row level security;
create policy "Users can CRUD own diaries"
  on diaries for all using (auth.uid() = user_id);
```

#### custom_contents (自定义内容)
```sql
create table custom_contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  text text not null,
  pinyin text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- RLS
alter table custom_contents enable row level security;
create policy "Users can CRUD own contents"
  on custom_contents for all using (auth.uid() = user_id);
```

#### courses (课程内容 - 公共)
```sql
create table courses (
  id text primary key,                  -- 如 'dzg-1', 'dzg-2'
  category text not null,               -- 'dizigui', 'tangshi', etc.
  title text not null,
  text text not null,
  pinyin text not null,
  sort_order int not null,              -- 排序
  is_active boolean default true,       -- 是否启用
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 公共表，所有人可读
alter table courses enable row level security;
create policy "Anyone can read courses"
  on courses for select using (true);
```

#### learning_records (学习记录)
```sql
create table learning_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  course_id text references courses(id) not null,
  learned_at timestamptz default now(),

  unique(user_id, course_id)            -- 每个用户每个课程只记录一次
);

-- RLS
alter table learning_records enable row level security;
create policy "Users can CRUD own records"
  on learning_records for all using (auth.uid() = user_id);
```

#### course_images (课程配图缓存)
```sql
create table course_images (
  id uuid primary key default gen_random_uuid(),
  course_id text references courses(id) not null,
  image_url text not null,              -- Supabase Storage URL
  generated_at timestamptz default now(),

  unique(course_id)                     -- 每个课程一张图
);

-- 公共表
alter table course_images enable row level security;
create policy "Anyone can read images"
  on course_images for select using (true);
create policy "Authenticated can insert images"
  on course_images for insert with check (auth.role() = 'authenticated');
```

### 2.3 Storage Buckets

```sql
-- 日记图片 (私有)
insert into storage.buckets (id, name, public)
values ('diary-photos', 'diary-photos', false);

-- 课程配图 (公开)
insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', true);

-- 用户头像 (公开)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);
```

---

## 三、功能模块设计

### 3.1 用户认证模块

#### 登录流程
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 输入手机号 │───▶│ 发送验证码 │───▶│ 输入验证码 │───▶│  登录成功  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                               │
                     ▼                               ▼
               Supabase Auth                  创建/获取 Profile
               发送 SMS                       同步本地数据
```

#### 新增页面
- `LoginPage.tsx` - 登录/注册页面
- 手机号输入 + 验证码输入
- 60秒倒计时重发

### 3.2 数据同步模块

#### 服务层结构
```
services/
├── supabase.ts          # Supabase 客户端初始化
├── authService.ts       # 认证服务
├── profileService.ts    # 用户资料服务
├── diaryService.ts      # 日记服务
├── contentService.ts    # 课程内容服务
├── storageService.ts    # 文件存储服务
└── syncService.ts       # 数据同步服务
```

#### 核心 API

```typescript
// authService.ts
export const authService = {
  sendOTP(phone: string): Promise<void>,
  verifyOTP(phone: string, code: string): Promise<User>,
  signOut(): Promise<void>,
  getSession(): Promise<Session | null>,
  onAuthStateChange(callback): Subscription
}

// profileService.ts
export const profileService = {
  getProfile(): Promise<Profile>,
  updateProfile(updates: Partial<Profile>): Promise<Profile>,
  addRedFlower(count: number): Promise<void>
}

// diaryService.ts
export const diaryService = {
  list(): Promise<Diary[]>,
  create(diary: NewDiary): Promise<Diary>,
  update(id: string, updates: Partial<Diary>): Promise<Diary>,
  delete(id: string): Promise<void>,
  uploadPhoto(file: File): Promise<string>  // 返回 URL
}

// contentService.ts
export const contentService = {
  getCourses(): Promise<Course[]>,
  getTodayCourse(offset: number): Promise<Course>,
  markAsLearned(courseId: string): Promise<void>,
  getLearningRecords(): Promise<LearningRecord[]>,

  // 自定义内容
  getCustomContents(): Promise<CustomContent[]>,
  addCustomContent(content: NewContent): Promise<CustomContent>,
  deleteCustomContent(id: string): Promise<void>
}

// storageService.ts
export const storageService = {
  uploadDiaryPhoto(file: File): Promise<string>,
  uploadCourseImage(courseId: string, base64: string): Promise<string>,
  getCourseImage(courseId: string): Promise<string | null>,
  deleteFile(bucket: string, path: string): Promise<void>
}
```

### 3.3 图片存储流程

#### 课程配图生成与存储
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  检查云端缓存 │───▶│  Gemini生成  │───▶│ 上传Storage │───▶│ 保存URL到DB │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │ 有缓存                                                  │
      ▼                                                        │
┌─────────────┐                                                │
│  直接返回URL │◀───────────────────────────────────────────────┘
└─────────────┘
```

#### 日记图片上传
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  选择图片    │───▶│ 压缩处理    │───▶│ 上传Storage │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            ▼
                                     返回公开URL
                                     存入 photos[]
```

---

## 四、代码改造清单

### 4.1 新增文件

| 文件 | 说明 |
|------|------|
| `services/supabase.ts` | Supabase 客户端 |
| `services/authService.ts` | 认证服务 |
| `services/profileService.ts` | 用户资料服务 |
| `services/diaryService.ts` | 日记服务 |
| `services/contentService.ts` | 课程内容服务 |
| `services/storageService.ts` | 文件存储服务 |
| `components/LoginPage.tsx` | 登录页面 |
| `hooks/useAuth.ts` | 认证状态 Hook |
| `hooks/useProfile.ts` | 用户资料 Hook |
| `contexts/AuthContext.tsx` | 认证上下文 |

### 4.2 修改文件

| 文件 | 改动内容 |
|------|----------|
| `App.tsx` | 添加认证判断、数据从云端加载 |
| `components/ChildMode.tsx` | 使用云端数据、图片URL |
| `components/ParentMode.tsx` | 使用云端服务 |
| `services/geminiService.ts` | 图片生成后上传云端 |
| `constants.ts` | 移除 CLASSIC_LIBRARY（改为云端） |
| `.env.local` | 添加 Supabase 配置 |

### 4.3 删除/废弃

| 内容 | 说明 |
|------|------|
| localStorage 相关代码 | 迁移到云端后移除 |
| `CLASSIC_LIBRARY` 常量 | 改为从数据库读取 |
| 本地图片缓存逻辑 | 改为云端存储 |

---

## 五、实现计划

### Phase 1: 基础设施 (Day 1)
- [ ] 创建 Supabase 项目
- [ ] 执行数据库建表 SQL
- [ ] 配置 Storage Buckets
- [ ] 配置 SMS 验证码（阿里云/腾讯云）
- [ ] 安装 @supabase/supabase-js

### Phase 2: 认证模块 (Day 2)
- [ ] 实现 supabase.ts 客户端
- [ ] 实现 authService.ts
- [ ] 创建 AuthContext
- [ ] 实现 LoginPage.tsx
- [ ] App.tsx 添加认证路由

### Phase 3: 数据服务 (Day 3)
- [ ] 实现 profileService.ts
- [ ] 实现 diaryService.ts
- [ ] 实现 contentService.ts
- [ ] 导入课程数据到 courses 表

### Phase 4: 存储服务 (Day 4)
- [ ] 实现 storageService.ts
- [ ] 改造 geminiService.ts 图片上传
- [ ] 改造日记图片上传

### Phase 5: 组件改造 (Day 5)
- [ ] 改造 App.tsx
- [ ] 改造 ChildMode.tsx
- [ ] 改造 ParentMode.tsx
- [ ] 移除 localStorage 代码

### Phase 6: 测试与上线 (Day 6)
- [ ] 功能测试
- [ ] 数据迁移脚本（可选）
- [ ] 部署上线

---

## 六、环境配置

### 6.1 环境变量

```env
# .env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 现有配置
VITE_GEMINI_API_KEY=AIzaSy...
```

### 6.2 依赖安装

```bash
npm install @supabase/supabase-js
```

---

## 七、数据迁移

### 7.1 课程数据初始化

需要将 `constants.ts` 中的 `CLASSIC_LIBRARY` 导入到 `courses` 表：

```typescript
// scripts/importCourses.ts
import { CLASSIC_LIBRARY } from '../constants';
import { supabase } from '../services/supabase';

async function importCourses() {
  const courses = CLASSIC_LIBRARY.map((item, index) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    text: item.text,
    pinyin: item.pinyin,
    sort_order: index,
    is_active: true
  }));

  const { error } = await supabase
    .from('courses')
    .upsert(courses);

  if (error) console.error('Import failed:', error);
  else console.log('Imported', courses.length, 'courses');
}
```

### 7.2 用户本地数据迁移

首次登录后，检测 localStorage 是否有数据，提示用户是否同步：

```typescript
async function migrateLocalData(userId: string) {
  // 检查本地是否有数据
  const localDiaries = localStorage.getItem('dingdang_diaries');
  const localProfile = localStorage.getItem('dingdang_profile');

  if (localDiaries || localProfile) {
    const confirm = window.confirm('检测到本地数据，是否同步到云端？');
    if (confirm) {
      // 执行同步...
    }
  }
}
```

---

## 八、安全考虑

### 8.1 RLS 策略
- 所有用户表启用 RLS
- 用户只能访问自己的数据
- courses 表公开只读

### 8.2 文件安全
- diary-photos bucket 私有，需认证访问
- course-images bucket 公开，可缓存
- 文件大小限制：图片 5MB

### 8.3 API 限流
- Supabase 自带限流
- 验证码发送：60秒间隔

---

## 九、成本估算

### Supabase 免费额度（足够个人使用）
| 资源 | 免费额度 |
|------|----------|
| 数据库 | 500MB |
| 存储 | 1GB |
| 带宽 | 2GB/月 |
| 认证用户 | 50,000 |

### 短信费用（按量付费）
- 阿里云：约 0.045元/条
- 腾讯云：约 0.05元/条

---

## 十、后续扩展

1. **微信登录** - 接入微信小程序/公众号登录
2. **学习报告** - 基于 learning_records 生成周/月报告
3. **家庭共享** - 多家长共同记录一个孩子
4. **离线支持** - Service Worker 缓存，离线可用
5. **推送通知** - 每日学习提醒

---

*文档版本: v1.0*
*创建日期: 2026-01-12*
