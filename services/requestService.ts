import { callApi, callApiSafe } from './apiService';
import { GiftRequest } from '../types';
import { encrypt, decrypt } from './cryptoService';

// 获取兑换申请列表
export async function getRequests(familyCode: string): Promise<GiftRequest[]> {
  try {
    const data = await callApi<GiftRequest[]>('getRequests', { familyCode, pendingOnly: false });

    // 解密 gift_name
    const decrypted = await Promise.all(
      (data || []).map(async (request) => ({
        ...request,
        gift_name: await decrypt(request.gift_name, familyCode),
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取兑换申请列表失败:', error);
    return [];
  }
}

// 获取待审批的申请
export async function getPendingRequests(familyCode: string): Promise<GiftRequest[]> {
  try {
    const data = await callApi<GiftRequest[]>('getRequests', { familyCode, pendingOnly: true });

    // 解密 gift_name
    const decrypted = await Promise.all(
      (data || []).map(async (request) => ({
        ...request,
        gift_name: await decrypt(request.gift_name, familyCode),
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取待审批申请失败:', error);
    return [];
  }
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
  // 加密 gift_name
  const encryptedGiftName = await encrypt(request.gift_name, familyCode);

  const result = await callApiSafe<GiftRequest>('createRequest', {
    familyCode,
    request: { ...request, gift_name: encryptedGiftName },
  });

  if (result.success && result.data) {
    // 返回解密后的数据
    return {
      success: true,
      data: { ...result.data, gift_name: request.gift_name },
    };
  }
  return { success: result.success, error: result.error };
}

// 批准申请
export async function approveRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe<{ success: boolean; error?: string }>('approveRequest', { requestId });
  return { success: result.data?.success ?? result.success, error: result.data?.error || result.error };
}

// 拒绝申请
export async function rejectRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('rejectRequest', { requestId });
  return { success: result.success, error: result.error };
}

// 删除申请（仅限待审批状态）
export async function deleteRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('deleteRequest', { requestId });
  return { success: result.success, error: result.error };
}

// 获取待审批数量
export async function getPendingCount(familyCode: string): Promise<number> {
  try {
    const data = await callApi<{ count: number }>('getPendingCount', { familyCode });
    return data?.count || 0;
  } catch (error) {
    console.error('获取待审批数量失败:', error);
    return 0;
  }
}
