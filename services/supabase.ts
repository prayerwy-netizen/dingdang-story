import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表名常量
export const TABLES = {
  PROFILES: 'dingdang_study_profiles',
  DIARIES: 'dingdang_study_diaries',
  COURSES: 'dingdang_study_courses',
  COURSE_IMAGES: 'dingdang_study_course_images',
  CUSTOM_CONTENTS: 'dingdang_study_custom_contents',
  LEARNING_RECORDS: 'dingdang_study_learning_records',
} as const;

// Storage bucket 名称
export const BUCKETS = {
  DIARY_PHOTOS: 'dingdang-diary-photos',
  COURSE_IMAGES: 'dingdang-course-images',
} as const;
