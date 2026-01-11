import { supabase, TABLES } from './supabase';
import type { ClassicContent } from '../types';

export interface CourseRecord {
  id: string;
  category: string;
  title: string;
  text: string;
  pinyin: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseImageRecord {
  id: string;
  course_id: string;
  image_url: string;
  generated_at: string;
}

export interface CustomContentRecord {
  id: string;
  user_id: string;
  title: string;
  text: string;
  pinyin: string | null;
  sort_order: number;
  created_at: string;
}

export interface LearningRecord {
  id: string;
  user_id: string;
  course_id: string;
  learned_at: string;
}

// ========== 课程内容 ==========

// 获取所有课程
export async function getCourses(category?: string): Promise<CourseRecord[]> {
  let query = supabase
    .from(TABLES.COURSES)
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('获取课程失败:', error);
    return [];
  }
  return data || [];
}

// 获取单个课程
export async function getCourse(courseId: string): Promise<CourseRecord | null> {
  const { data, error } = await supabase
    .from(TABLES.COURSES)
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) {
    console.error('获取课程失败:', error);
    return null;
  }
  return data;
}

// 转换为前端格式
export function toFrontendContent(record: CourseRecord, isLearned = false): ClassicContent {
  return {
    id: record.id,
    title: record.title,
    text: record.text,
    pinyin: record.pinyin,
    category: record.category as 'dizigui' | 'tangshi' | 'custom',
    isLearned,
  };
}

// ========== 课程配图缓存 ==========

// 获取课程配图
export async function getCourseImage(courseId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from(TABLES.COURSE_IMAGES)
    .select('image_url')
    .eq('course_id', courseId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('获取课程配图失败:', error);
  }
  return data?.image_url || null;
}

// 保存课程配图
export async function saveCourseImage(
  courseId: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.COURSE_IMAGES)
    .upsert(
      { course_id: courseId, image_url: imageUrl },
      { onConflict: 'course_id' }
    );

  if (error) {
    console.error('保存课程配图失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ========== 自定义内容 ==========

// 获取用户自定义内容
export async function getCustomContents(userId: string): Promise<CustomContentRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOM_CONTENTS)
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('获取自定义内容失败:', error);
    return [];
  }
  return data || [];
}

// 创建自定义内容
export async function createCustomContent(
  userId: string,
  content: {
    title: string;
    text: string;
    pinyin?: string;
  }
): Promise<{ success: boolean; data?: CustomContentRecord; error?: string }> {
  // 获取当前最大 sort_order
  const existing = await getCustomContents(userId);
  const maxOrder = existing.reduce((max, c) => Math.max(max, c.sort_order), -1);

  const { data, error } = await supabase
    .from(TABLES.CUSTOM_CONTENTS)
    .insert({
      user_id: userId,
      title: content.title,
      text: content.text,
      pinyin: content.pinyin || null,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    console.error('创建自定义内容失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// 更新自定义内容
export async function updateCustomContent(
  contentId: string,
  updates: Partial<Pick<CustomContentRecord, 'title' | 'text' | 'pinyin'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.CUSTOM_CONTENTS)
    .update(updates)
    .eq('id', contentId);

  if (error) {
    console.error('更新自定义内容失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 删除自定义内容
export async function deleteCustomContent(contentId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.CUSTOM_CONTENTS)
    .delete()
    .eq('id', contentId);

  if (error) {
    console.error('删除自定义内容失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 转换自定义内容为前端格式
export function customToFrontendContent(record: CustomContentRecord): ClassicContent {
  return {
    id: record.id,
    title: record.title,
    text: record.text,
    pinyin: record.pinyin || '',
    category: 'custom',
    isLearned: false,
  };
}

// ========== 学习记录 ==========

// 获取用户学习记录
export async function getLearningRecords(userId: string): Promise<LearningRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.LEARNING_RECORDS)
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('获取学习记录失败:', error);
    return [];
  }
  return data || [];
}

// 检查课程是否已学习
export async function isCourseLearned(userId: string, courseId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(TABLES.LEARNING_RECORDS)
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('检查学习记录失败:', error);
  }
  return !!data;
}

// 标记课程为已学习
export async function markCourseAsLearned(
  userId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.LEARNING_RECORDS)
    .upsert(
      { user_id: userId, course_id: courseId },
      { onConflict: 'user_id,course_id' }
    );

  if (error) {
    console.error('标记学习记录失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 获取已学习的课程ID列表
export async function getLearnedCourseIds(userId: string): Promise<Set<string>> {
  const records = await getLearningRecords(userId);
  return new Set(records.map(r => r.course_id));
}
