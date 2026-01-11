import { supabase, TABLES } from './supabase';

export interface Profile {
  id: string;
  phone: string | null;
  name: string;
  age: number;
  avatar_url: string | null;
  red_flowers: number;
  course_offset: number;
  created_at: string;
  updated_at: string;
}

// 获取用户资料
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('获取用户资料失败:', error);
    return null;
  }
  return data;
}

// 更新用户资料
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'name' | 'age' | 'avatar_url' | 'red_flowers' | 'course_offset'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.PROFILES)
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('更新用户资料失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 增加小红花
export async function addRedFlowers(
  userId: string,
  count: number
): Promise<{ success: boolean; newTotal?: number; error?: string }> {
  // 先获取当前数量
  const profile = await getProfile(userId);
  if (!profile) {
    return { success: false, error: '用户不存在' };
  }

  const newTotal = profile.red_flowers + count;
  const result = await updateProfile(userId, { red_flowers: newTotal });

  if (result.success) {
    return { success: true, newTotal };
  }
  return result;
}

// 重置课程进度
export async function resetCourseProgress(userId: string): Promise<{ success: boolean; error?: string }> {
  // 1. 重置 course_offset 为 0
  const updateResult = await updateProfile(userId, { course_offset: 0 });
  if (!updateResult.success) {
    return updateResult;
  }

  // 2. 删除所有学习记录
  const { error } = await supabase
    .from(TABLES.LEARNING_RECORDS)
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('删除学习记录失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 更新课程进度偏移
export async function updateCourseOffset(
  userId: string,
  offset: number
): Promise<{ success: boolean; error?: string }> {
  return updateProfile(userId, { course_offset: offset });
}
