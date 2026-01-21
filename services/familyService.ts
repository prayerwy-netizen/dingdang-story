import { callApi, callApiSafe } from './apiService';
import type { ClassicContent } from '../types';
import { encrypt, decrypt } from './cryptoService';

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
  try {
    const data = await callApi<Profile>('getOrCreateProfile', { familyCode });
    return data;
  } catch (error) {
    console.error('获取 Profile 失败:', error);
    return null;
  }
}

// 更新 Profile
export async function updateProfile(
  familyCode: string,
  updates: Partial<Pick<Profile, 'name' | 'age' | 'red_flowers' | 'course_offset'>>
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('updateProfile', { familyCode, updates });
  return { success: result.success, error: result.error };
}

// 重置课程进度
export async function resetCourseProgress(familyCode: string, newOffset: number): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('resetCourseProgress', { familyCode, newOffset });
  return { success: result.success, error: result.error };
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
  try {
    const data = await callApi<DiaryRecord[]>('getDiaries', { familyCode });

    // 解密内容
    const decrypted = await Promise.all(
      (data || []).map(async (record) => ({
        ...record,
        content: await decrypt(record.content, familyCode),
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取日记失败:', error);
    return [];
  }
}

export async function createDiary(
  familyCode: string,
  diary: { date: string; content: string; photos?: string[]; is_draft?: boolean }
): Promise<{ success: boolean; data?: DiaryRecord; error?: string }> {
  // 加密内容
  const encryptedContent = await encrypt(diary.content, familyCode);

  const result = await callApiSafe<DiaryRecord>('createDiary', {
    familyCode,
    diary: {
      ...diary,
      content: encryptedContent,
    },
  });

  if (result.success && result.data) {
    // 返回时解密，供前端显示
    return { success: true, data: { ...result.data, content: diary.content } };
  }
  return { success: result.success, error: result.error };
}

export async function updateDiary(
  diaryId: string,
  updates: Partial<Pick<DiaryRecord, 'content' | 'photos' | 'is_draft'>>,
  familyCode?: string
): Promise<{ success: boolean; error?: string }> {
  // 如果更新内容且有家庭码，则加密
  const encryptedUpdates = { ...updates };
  if (updates.content && familyCode) {
    encryptedUpdates.content = await encrypt(updates.content, familyCode);
  }

  const result = await callApiSafe('updateDiary', { diaryId, updates: encryptedUpdates });
  return { success: result.success, error: result.error };
}

export async function deleteDiary(diaryId: string): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('deleteDiary', { diaryId });
  return { success: result.success, error: result.error };
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
  try {
    const data = await callApi<CustomContentRecord[]>('getCustomContents', { familyCode });

    // 解密内容
    const decrypted = await Promise.all(
      (data || []).map(async (record) => ({
        ...record,
        title: await decrypt(record.title, familyCode),
        text: await decrypt(record.text, familyCode),
        pinyin: record.pinyin ? await decrypt(record.pinyin, familyCode) : null,
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取自定义内容失败:', error);
    return [];
  }
}

export async function createCustomContent(
  familyCode: string,
  content: { title: string; text: string; pinyin?: string }
): Promise<{ success: boolean; data?: CustomContentRecord; error?: string }> {
  // 先获取现有内容以确定排序
  const existing = await getCustomContents(familyCode);
  const maxOrder = existing.reduce((max, c) => Math.max(max, c.sort_order), -1);

  // 加密内容
  const encryptedTitle = await encrypt(content.title, familyCode);
  const encryptedText = await encrypt(content.text, familyCode);
  const encryptedPinyin = content.pinyin ? await encrypt(content.pinyin, familyCode) : null;

  const result = await callApiSafe<CustomContentRecord>('createCustomContent', {
    familyCode,
    content: {
      title: encryptedTitle,
      text: encryptedText,
      pinyin: encryptedPinyin,
    },
    sortOrder: maxOrder + 1,
  });

  if (result.success && result.data) {
    // 返回解密后的数据供前端显示
    return {
      success: true,
      data: {
        ...result.data,
        title: content.title,
        text: content.text,
        pinyin: content.pinyin || null,
      },
    };
  }
  return { success: result.success, error: result.error };
}

export async function deleteCustomContent(contentId: string): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('deleteCustomContent', { contentId });
  return { success: result.success, error: result.error };
}

// ========== Learning Records ==========

export interface LearningRecord {
  id: string;
  family_code: string;
  course_id: string;
  learned_at: string;
}

export async function getLearningRecords(familyCode: string): Promise<LearningRecord[]> {
  try {
    const data = await callApi<LearningRecord[]>('getLearningRecords', { familyCode });
    return data || [];
  } catch (error) {
    console.error('获取学习记录失败:', error);
    return [];
  }
}

export async function getLearnedCourseIds(familyCode: string): Promise<Set<string>> {
  const records = await getLearningRecords(familyCode);
  return new Set(records.map(r => r.course_id));
}

export async function markCourseAsLearned(
  familyCode: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('markCourseAsLearned', { familyCode, courseId });
  return { success: result.success, error: result.error };
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

// ========== 批量加载 ==========

export interface AllUserData {
  profile: Profile;
  diaries: DiaryRecord[];
  customContents: CustomContentRecord[];
  learningRecords: LearningRecord[];
}

// 批量加载所有用户数据（单次 API 调用）
export async function loadAllUserData(familyCode: string): Promise<AllUserData | null> {
  try {
    const data = await callApi<AllUserData>('loadAllUserData', { familyCode });
    if (!data) return null;

    // 解密日记内容
    const decryptedDiaries = await Promise.all(
      (data.diaries || []).map(async (record) => ({
        ...record,
        content: await decrypt(record.content, familyCode),
      }))
    );

    // 解密自定义内容
    const decryptedCustomContents = await Promise.all(
      (data.customContents || []).map(async (record) => ({
        ...record,
        title: await decrypt(record.title, familyCode),
        text: await decrypt(record.text, familyCode),
        pinyin: record.pinyin ? await decrypt(record.pinyin, familyCode) : null,
      }))
    );

    return {
      profile: data.profile,
      diaries: decryptedDiaries,
      customContents: decryptedCustomContents,
      learningRecords: data.learningRecords || [],
    };
  } catch (error) {
    console.error('批量加载用户数据失败:', error);
    return null;
  }
}
