import { supabase, TABLES } from './supabase';

export interface DiaryRecord {
  id: string;
  user_id: string;
  date: string;
  content: string;
  photos: string[];
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

// 获取用户所有日记
export async function getDiaries(userId: string): Promise<DiaryRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.DIARIES)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('获取日记列表失败:', error);
    return [];
  }
  return data || [];
}

// 获取单条日记
export async function getDiary(diaryId: string): Promise<DiaryRecord | null> {
  const { data, error } = await supabase
    .from(TABLES.DIARIES)
    .select('*')
    .eq('id', diaryId)
    .single();

  if (error) {
    console.error('获取日记失败:', error);
    return null;
  }
  return data;
}

// 获取指定日期的日记
export async function getDiaryByDate(userId: string, date: string): Promise<DiaryRecord | null> {
  const { data, error } = await supabase
    .from(TABLES.DIARIES)
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('获取日记失败:', error);
  }
  return data || null;
}

// 创建日记
export async function createDiary(
  userId: string,
  diary: {
    date: string;
    content: string;
    photos?: string[];
    is_draft?: boolean;
  }
): Promise<{ success: boolean; data?: DiaryRecord; error?: string }> {
  const { data, error } = await supabase
    .from(TABLES.DIARIES)
    .insert({
      user_id: userId,
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

// 更新日记
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

// 删除日记
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

// 转换为前端格式
export function toFrontendDiary(record: DiaryRecord) {
  return {
    id: record.id,
    date: record.date,
    content: record.content,
    photos: record.photos,
    isDraft: record.is_draft,
  };
}

// 从前端格式转换
export function fromFrontendDiary(diary: {
  id?: string;
  date: string;
  content: string;
  photos?: string[];
  isDraft?: boolean;
}) {
  return {
    date: diary.date,
    content: diary.content,
    photos: diary.photos || [],
    is_draft: diary.isDraft || false,
  };
}
