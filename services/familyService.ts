import { supabase, TABLES } from './supabase';
import type { ClassicContent } from '../types';

// ========== Profile ==========

export interface Profile {
  id: string;
  family_code: string;
  name: string;
  age: number;
  avatar_url: string | null;
  red_flowers: number;
  course_offset: number;
  created_at: string;
  updated_at: string;
}

// 获取或创建 Profile
export async function getOrCreateProfile(familyCode: string): Promise<Profile | null> {
  // 先尝试获取
  const { data: existing, error: fetchError } = await supabase
    .from(TABLES.PROFILES)
    .select('*')
    .eq('family_code', familyCode)
    .single();

  if (existing) {
    return existing;
  }

  // 不存在则创建
  const { data: created, error: createError } = await supabase
    .from(TABLES.PROFILES)
    .insert({ family_code: familyCode })
    .select()
    .single();

  if (createError) {
    console.error('创建 Profile 失败:', createError);
    return null;
  }

  return created;
}

// 更新 Profile
export async function updateProfile(
  familyCode: string,
  updates: Partial<Pick<Profile, 'name' | 'age' | 'red_flowers' | 'course_offset'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.PROFILES)
    .update(updates)
    .eq('family_code', familyCode);

  if (error) {
    console.error('更新 Profile 失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 重置课程进度
export async function resetCourseProgress(familyCode: string, newOffset: number): Promise<{ success: boolean; error?: string }> {
  // 设置 course_offset 为当前 baseIndex，这样 todayIndex = baseIndex - newOffset = 0
  const updateResult = await updateProfile(familyCode, { course_offset: newOffset });
  if (!updateResult.success) return updateResult;

  // 删除学习记录
  const { error } = await supabase
    .from(TABLES.LEARNING_RECORDS)
    .delete()
    .eq('family_code', familyCode);

  if (error) {
    console.error('删除学习记录失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ========== Diary ==========

export interface DiaryRecord {
  id: string;
  family_code: string;
  date: string;
  content: string;
  photos: string[];
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export async function getDiaries(familyCode: string): Promise<DiaryRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.DIARIES)
    .select('*')
    .eq('family_code', familyCode)
    .order('date', { ascending: false });

  if (error) {
    console.error('获取日记失败:', error);
    return [];
  }
  return data || [];
}

export async function createDiary(
  familyCode: string,
  diary: { date: string; content: string; photos?: string[]; is_draft?: boolean }
): Promise<{ success: boolean; data?: DiaryRecord; error?: string }> {
  const { data, error } = await supabase
    .from(TABLES.DIARIES)
    .insert({
      family_code: familyCode,
      date: diary.date,
      content: diary.content,
      photos: diary.photos || [],
      is_draft: diary.is_draft || false,
    })
    .select()
    .single();

  if (error) {
    console.error('创建日记失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

export async function updateDiary(
  diaryId: string,
  updates: Partial<Pick<DiaryRecord, 'content' | 'photos' | 'is_draft'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.DIARIES)
    .update(updates)
    .eq('id', diaryId);

  if (error) {
    console.error('更新日记失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteDiary(diaryId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.DIARIES)
    .delete()
    .eq('id', diaryId);

  if (error) {
    console.error('删除日记失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ========== Custom Content ==========

export interface CustomContentRecord {
  id: string;
  family_code: string;
  title: string;
  text: string;
  pinyin: string | null;
  sort_order: number;
  created_at: string;
}

export async function getCustomContents(familyCode: string): Promise<CustomContentRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOM_CONTENTS)
    .select('*')
    .eq('family_code', familyCode)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('获取自定义内容失败:', error);
    return [];
  }
  return data || [];
}

export async function createCustomContent(
  familyCode: string,
  content: { title: string; text: string; pinyin?: string }
): Promise<{ success: boolean; data?: CustomContentRecord; error?: string }> {
  const existing = await getCustomContents(familyCode);
  const maxOrder = existing.reduce((max, c) => Math.max(max, c.sort_order), -1);

  const { data, error } = await supabase
    .from(TABLES.CUSTOM_CONTENTS)
    .insert({
      family_code: familyCode,
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

// ========== Learning Records ==========

export interface LearningRecord {
  id: string;
  family_code: string;
  course_id: string;
  learned_at: string;
}

export async function getLearningRecords(familyCode: string): Promise<LearningRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.LEARNING_RECORDS)
    .select('*')
    .eq('family_code', familyCode);

  if (error) {
    console.error('获取学习记录失败:', error);
    return [];
  }
  return data || [];
}

export async function getLearnedCourseIds(familyCode: string): Promise<Set<string>> {
  const records = await getLearningRecords(familyCode);
  return new Set(records.map(r => r.course_id));
}

export async function markCourseAsLearned(
  familyCode: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.LEARNING_RECORDS)
    .upsert(
      { family_code: familyCode, course_id: courseId },
      { onConflict: 'family_code,course_id' }
    );

  if (error) {
    console.error('标记学习记录失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ========== 转换函数 ==========

export function toFrontendDiary(record: DiaryRecord) {
  return {
    id: record.id,
    date: record.date,
    content: record.content,
    photos: record.photos,
    isDraft: record.is_draft,
  };
}

export function toFrontendContent(record: CustomContentRecord): ClassicContent {
  // 将数据库的 text + pinyin 转换为 phrases 格式
  const textParts = record.text.split(/\s+/).filter(t => t.length > 0);
  const pinyinParts = (record.pinyin || '').split(/\s+/).filter(p => p.length > 0);

  // 按三字一组分配拼音
  const phrases: { text: string; pinyin: string }[] = [];
  let pinyinIdx = 0;
  for (const text of textParts) {
    const charCount = text.length;
    const pinyin = pinyinParts.slice(pinyinIdx, pinyinIdx + charCount).join(' ');
    phrases.push({ text, pinyin });
    pinyinIdx += charCount;
  }

  return {
    id: record.id,
    title: record.title,
    phrases,
    category: 'custom',
    isLearned: false,
  };
}
