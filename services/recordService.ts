import { callApi, callApiSafe } from './apiService';
import { PointRecord } from '../types';
import { encrypt, decrypt } from './cryptoService';

// 获取积分记录列表
export async function getRecords(familyCode: string): Promise<PointRecord[]> {
  try {
    const data = await callApi<PointRecord[]>('getRecords', { familyCode });

    // 解密 task_name 和 note
    const decrypted = await Promise.all(
      (data || []).map(async (record) => ({
        ...record,
        task_name: await decrypt(record.task_name, familyCode),
        note: record.note ? await decrypt(record.note, familyCode) : undefined,
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取积分记录失败:', error);
    return [];
  }
}

// 获取指定月份的记录
export async function getRecordsByMonth(
  familyCode: string,
  year: number,
  month: number
): Promise<PointRecord[]> {
  try {
    const data = await callApi<PointRecord[]>('getRecordsByMonth', { familyCode, year, month });

    // 解密 task_name 和 note
    const decrypted = await Promise.all(
      (data || []).map(async (record) => ({
        ...record,
        task_name: await decrypt(record.task_name, familyCode),
        note: record.note ? await decrypt(record.note, familyCode) : undefined,
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取月度记录失败:', error);
    return [];
  }
}

// 获取指定日期的记录
export async function getRecordsByDate(
  familyCode: string,
  date: string
): Promise<PointRecord[]> {
  try {
    const data = await callApi<PointRecord[]>('getRecordsByDate', { familyCode, date });

    // 解密 task_name 和 note
    const decrypted = await Promise.all(
      (data || []).map(async (record) => ({
        ...record,
        task_name: await decrypt(record.task_name, familyCode),
        note: record.note ? await decrypt(record.note, familyCode) : undefined,
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取日期记录失败:', error);
    return [];
  }
}

// 添加积分记录
export async function addRecord(
  familyCode: string,
  record: {
    task_id?: string;
    task_name: string;
    score: number;
    note?: string;
    date?: string;
  }
): Promise<{ success: boolean; data?: PointRecord; error?: string }> {
  // 加密 task_name 和 note
  const encryptedTaskName = await encrypt(record.task_name, familyCode);
  const encryptedNote = record.note ? await encrypt(record.note, familyCode) : undefined;

  const result = await callApiSafe<PointRecord>('addRecord', {
    familyCode,
    record: {
      ...record,
      task_name: encryptedTaskName,
      note: encryptedNote,
    },
  });

  if (result.success && result.data) {
    // 返回解密后的数据
    return {
      success: true,
      data: {
        ...result.data,
        task_name: record.task_name,
        note: record.note,
      },
    };
  }
  return { success: result.success, error: result.error };
}

// 删除积分记录
export async function deleteRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('deleteRecord', { recordId });
  return { success: result.success, error: result.error };
}

// 获取总积分
export async function getTotalScore(familyCode: string): Promise<number> {
  try {
    const data = await callApi<{ total: number }>('getTotalScore', { familyCode });
    return data?.total || 0;
  } catch (error) {
    console.error('计算总积分失败:', error);
    return 0;
  }
}

// 获取每日积分汇总（用于日历显示）
export async function getDailyScores(
  familyCode: string,
  year: number,
  month: number
): Promise<Map<string, number>> {
  const records = await getRecordsByMonth(familyCode, year, month);
  const dailyScores = new Map<string, number>();

  for (const record of records) {
    const current = dailyScores.get(record.date) || 0;
    dailyScores.set(record.date, current + record.score);
  }

  return dailyScores;
}
