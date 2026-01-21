import { callApi, callApiSafe } from './apiService';
import { Gift } from '../types';
import { encrypt, decrypt } from './cryptoService';

// 获取礼物列表
export async function getGifts(familyCode: string): Promise<Gift[]> {
  try {
    const data = await callApi<Gift[]>('getGifts', { familyCode, enabledOnly: false });

    // 解密礼物名
    const decrypted = await Promise.all(
      (data || []).map(async (gift) => ({
        ...gift,
        name: await decrypt(gift.name, familyCode),
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取礼物列表失败:', error);
    return [];
  }
}

// 获取启用的礼物列表
export async function getEnabledGifts(familyCode: string): Promise<Gift[]> {
  try {
    const data = await callApi<Gift[]>('getGifts', { familyCode, enabledOnly: true });

    // 解密礼物名
    const decrypted = await Promise.all(
      (data || []).map(async (gift) => ({
        ...gift,
        name: await decrypt(gift.name, familyCode),
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取启用礼物列表失败:', error);
    return [];
  }
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
  // 加密礼物名
  const encryptedName = await encrypt(gift.name, familyCode);

  const result = await callApiSafe<Gift>('createGift', {
    familyCode,
    gift: { ...gift, name: encryptedName },
  });

  if (result.success && result.data) {
    // 返回解密后的数据
    return { success: true, data: { ...result.data, name: gift.name } };
  }
  return { success: result.success, error: result.error };
}

// 更新礼物
export async function updateGift(
  giftId: string,
  updates: Partial<Pick<Gift, 'name' | 'image' | 'score' | 'enabled'>>,
  familyCode?: string
): Promise<{ success: boolean; error?: string }> {
  // 如果更新name且有familyCode，则加密
  const encryptedUpdates = { ...updates };
  if (updates.name && familyCode) {
    encryptedUpdates.name = await encrypt(updates.name, familyCode);
  }

  const result = await callApiSafe('updateGift', { giftId, updates: encryptedUpdates });
  return { success: result.success, error: result.error };
}

// 切换礼物启用状态
export async function toggleGiftEnabled(
  giftId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('toggleGiftEnabled', { giftId, enabled });
  return { success: result.success, error: result.error };
}

// 删除礼物
export async function deleteGift(
  giftId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('deleteGift', { giftId });
  return { success: result.success, error: result.error };
}
