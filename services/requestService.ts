import { supabase, TABLES } from './supabase';
import { GiftRequest } from '../types';
import { getTotalScore, addRecord } from './recordService';

// 数据库记录类型
interface RequestDbRow {
  id: string;
  family_code: string;
  gift_id: string;
  gift_name: string;
  score: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  created_at?: string;
}

// 获取兑换申请列表
export async function getRequests(familyCode: string): Promise<GiftRequest[]> {
  const { data, error } = await supabase
    .from(TABLES.REQUESTS)
    .select('*')
    .eq('family_code', familyCode)
    .order('date', { ascending: false });

  if (error) {
    console.error('获取兑换申请列表失败:', error);
    return [];
  }
  return (data || []).map(toFrontendRequest);
}

// 获取待审批的申请
export async function getPendingRequests(familyCode: string): Promise<GiftRequest[]> {
  const { data, error } = await supabase
    .from(TABLES.REQUESTS)
    .select('*')
    .eq('family_code', familyCode)
    .eq('status', 'pending')
    .order('date', { ascending: false });

  if (error) {
    console.error('获取待审批申请失败:', error);
    return [];
  }
  return (data || []).map(toFrontendRequest);
}

// 创建兑换申请
export async function createRequest(
  familyCode: string,
  request: {
    gift_id: string;
    gift_name: string;
    score: number;
  }
): Promise<{ success: boolean; data?: GiftRequest; error?: string }> {
  // 先检查积分是否足够
  const totalScore = await getTotalScore(familyCode);
  if (totalScore < request.score) {
    return { success: false, error: '积分不足' };
  }

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from(TABLES.REQUESTS)
    .insert({
      family_code: familyCode,
      gift_id: request.gift_id,
      gift_name: request.gift_name,
      score: request.score,
      status: 'pending',
      date: today,
    })
    .select()
    .single();

  if (error) {
    console.error('创建兑换申请失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: toFrontendRequest(data) };
}

// 批准申请
export async function approveRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  // 获取申请详情
  const { data: request, error: fetchError } = await supabase
    .from(TABLES.REQUESTS)
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) {
    return { success: false, error: '申请不存在' };
  }

  // 检查积分是否足够
  const totalScore = await getTotalScore(request.family_code);
  if (totalScore < request.score) {
    return { success: false, error: '积分不足，无法批准' };
  }

  // 更新申请状态
  const { error: updateError } = await supabase
    .from(TABLES.REQUESTS)
    .update({ status: 'approved' })
    .eq('id', requestId);

  if (updateError) {
    console.error('批准申请失败:', updateError);
    return { success: false, error: updateError.message };
  }

  // 扣除积分
  const result = await addRecord(request.family_code, {
    task_name: `兑换：${request.gift_name}`,
    score: -request.score,
    note: '礼物兑换扣除',
  });

  if (!result.success) {
    // 回滚状态
    await supabase
      .from(TABLES.REQUESTS)
      .update({ status: 'pending' })
      .eq('id', requestId);
    return { success: false, error: '积分扣除失败' };
  }

  return { success: true };
}

// 拒绝申请
export async function rejectRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.REQUESTS)
    .update({ status: 'rejected' })
    .eq('id', requestId);

  if (error) {
    console.error('拒绝申请失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 删除申请（仅限待审批状态）
export async function deleteRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from(TABLES.REQUESTS)
    .delete()
    .eq('id', requestId)
    .eq('status', 'pending');

  if (error) {
    console.error('删除申请失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 获取待审批数量
export async function getPendingCount(familyCode: string): Promise<number> {
  const { count, error } = await supabase
    .from(TABLES.REQUESTS)
    .select('*', { count: 'exact', head: true })
    .eq('family_code', familyCode)
    .eq('status', 'pending');

  if (error) {
    console.error('获取待审批数量失败:', error);
    return 0;
  }
  return count || 0;
}

// 转换为前端格式
function toFrontendRequest(record: RequestDbRow): GiftRequest {
  return {
    id: record.id,
    family_code: record.family_code,
    gift_id: record.gift_id,
    gift_name: record.gift_name,
    score: record.score,
    status: record.status,
    date: record.date,
  };
}
