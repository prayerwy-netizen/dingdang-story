import { supabase, TABLES } from './supabase';
import { Gift } from '../types';

// 数据库记录类型
interface GiftRecord {
  id: string;
  family_code: string;
  name: string;
  image: string;
  score: number;
  enabled: boolean;
  created_at: string;
  updated_at?: string;
}

// 获取礼物列表
export async function getGifts(familyCode: string): Promise<Gift[]> {
  const { data, error } = await supabase
    .from(TABLES.GIFTS)
    .select('*')
    .eq('family_code', familyCode)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('获取礼物列表失败:', error);
    return [];
  }
  return (data || []).map(toFrontendGift);
}

// 获取启用的礼物列表
export async function getEnabledGifts(familyCode: string): Promise<Gift[]> {
  const { data, error } = await supabase
    .from(TABLES.GIFTS)
    .select('*')
    .eq('family_code', familyCode)
    .eq('enabled', true)
    .order('score', { ascending: true });

  if (error) {
    console.error('获取启用礼物列表失败:', error);
    return [];
  }
  return (data || []).map(toFrontendGift);
}

// 创建礼物
export async function createGift(
  familyCode: string,
  gift: {
    name: string;
    image: string;
    score: number;
  }
): Promise<{ success: boolean; data?: Gift; error?: string }> {
  const { data, error } = await supabase
    .from(TABLES.GIFTS)
    .insert({
      family_code: familyCode,
      name: gift.name,
      image: gift.image,
      score: gift.score,
      enabled: true,
    })
    .select()
    .single();

  if (error) {
    console.error('创建礼物失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: toFrontendGift(data) };
}

// 更新礼物
export async function updateGift(
  giftId: string,
  updates: Partial<Pick<Gift, 'name' | 'image' | 'score' | 'enabled'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.GIFTS)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', giftId);

  if (error) {
    console.error('更新礼物失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 切换礼物启用状态
export async function toggleGiftEnabled(
  giftId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateGift(giftId, { enabled });
}

// 删除礼物
export async function deleteGift(
  giftId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.GIFTS)
    .delete()
    .eq('id', giftId);

  if (error) {
    console.error('删除礼物失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 转换为前端格式
function toFrontendGift(record: GiftRecord): Gift {
  return {
    id: record.id,
    family_code: record.family_code,
    name: record.name,
    image: record.image,
    score: record.score,
    enabled: record.enabled,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}
