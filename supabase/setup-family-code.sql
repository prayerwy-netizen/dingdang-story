-- ============================================
-- 叮当讲故事 - 家庭码方案
-- 无需认证，使用家庭码识别用户
-- ============================================

-- 1. 修改 profiles 表，移除 auth.users 外键依赖
-- 先删除旧的触发器和策略
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_dingdang_study_profiles_updated_at ON dingdang_study_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON dingdang_study_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON dingdang_study_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON dingdang_study_profiles;

-- 删除旧表（如果需要重建）
DROP TABLE IF EXISTS dingdang_study_learning_records;
DROP TABLE IF EXISTS dingdang_study_custom_contents;
DROP TABLE IF EXISTS dingdang_study_course_images;
DROP TABLE IF EXISTS dingdang_study_diaries;
DROP TABLE IF EXISTS dingdang_study_profiles;

-- 2. 创建新的 profiles 表（使用 family_code 作为标识）
CREATE TABLE dingdang_study_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '宝贝',
  age INT NOT NULL DEFAULT 5,
  avatar_url TEXT,
  red_flowers INT NOT NULL DEFAULT 0,
  course_offset INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_family_code ON dingdang_study_profiles(family_code);

-- 3. 成长日记表
CREATE TABLE dingdang_study_diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_code TEXT NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_diaries_family_code ON dingdang_study_diaries(family_code);
CREATE INDEX idx_diaries_date ON dingdang_study_diaries(date DESC);

-- 4. 课程配图缓存表（公共，不需要 family_code）
CREATE TABLE IF NOT EXISTS dingdang_study_course_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 自定义内容表
CREATE TABLE dingdang_study_custom_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_code TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  pinyin TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_custom_contents_family_code ON dingdang_study_custom_contents(family_code);

-- 6. 学习记录表
CREATE TABLE dingdang_study_learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_code TEXT NOT NULL,
  course_id TEXT NOT NULL,
  learned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_code, course_id)
);

CREATE INDEX idx_learning_records_family_code ON dingdang_study_learning_records(family_code);

-- 7. 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON dingdang_study_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diaries_updated_at
  BEFORE UPDATE ON dingdang_study_diaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 关闭 RLS（个人使用，简化处理）
ALTER TABLE dingdang_study_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE dingdang_study_diaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE dingdang_study_course_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE dingdang_study_custom_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE dingdang_study_learning_records DISABLE ROW LEVEL SECURITY;

-- 9. 课程表保持不变（如果已存在）
-- dingdang_study_courses 表应该已经创建并导入数据

-- ============================================
-- 完成！
-- 现在可以使用 family_code 来识别用户
-- 无需任何认证
-- ============================================
