-- ============================================
-- 叮当打卡 表迁移脚本
-- 为旧表添加 family_code 字段，支持多家庭隔离
-- ============================================

-- 1. 给 dingdang_tasks 添加 family_code
ALTER TABLE dingdang_tasks ADD COLUMN IF NOT EXISTS family_code TEXT;
UPDATE dingdang_tasks SET family_code = 'dingdang' WHERE family_code IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_family_code ON dingdang_tasks(family_code);

-- 2. 给 dingdang_gifts 添加 family_code
ALTER TABLE dingdang_gifts ADD COLUMN IF NOT EXISTS family_code TEXT;
UPDATE dingdang_gifts SET family_code = 'dingdang' WHERE family_code IS NULL;
CREATE INDEX IF NOT EXISTS idx_gifts_family_code ON dingdang_gifts(family_code);

-- 3. 给 dingdang_records 添加 family_code
ALTER TABLE dingdang_records ADD COLUMN IF NOT EXISTS family_code TEXT;
UPDATE dingdang_records SET family_code = 'dingdang' WHERE family_code IS NULL;
CREATE INDEX IF NOT EXISTS idx_records_family_code ON dingdang_records(family_code);

-- 4. 给 dingdang_requests 添加 family_code
ALTER TABLE dingdang_requests ADD COLUMN IF NOT EXISTS family_code TEXT;
UPDATE dingdang_requests SET family_code = 'dingdang' WHERE family_code IS NULL;
CREATE INDEX IF NOT EXISTS idx_requests_family_code ON dingdang_requests(family_code);

-- 5. 给 dingdang_settings 添加 family_code
ALTER TABLE dingdang_settings ADD COLUMN IF NOT EXISTS family_code TEXT;
UPDATE dingdang_settings SET family_code = 'dingdang' WHERE family_code IS NULL;
CREATE INDEX IF NOT EXISTS idx_settings_family_code ON dingdang_settings(family_code);

-- 6. 关闭 RLS（个人使用，简化处理）
ALTER TABLE dingdang_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE dingdang_gifts DISABLE ROW LEVEL SECURITY;
ALTER TABLE dingdang_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE dingdang_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE dingdang_settings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 完成！
-- 所有旧数据的 family_code 已设置为 'dingdang'
-- ============================================
