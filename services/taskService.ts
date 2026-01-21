import { callApi, callApiSafe } from './apiService';
import { Task } from '../types';
import { encrypt, decrypt } from './cryptoService';

// 获取任务列表
export async function getTasks(familyCode: string): Promise<Task[]> {
  try {
    const data = await callApi<Task[]>('getTasks', { familyCode, enabledOnly: false });

    // 解密任务名
    const decrypted = await Promise.all(
      (data || []).map(async (task) => ({
        ...task,
        name: await decrypt(task.name, familyCode),
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return [];
  }
}

// 获取启用的任务列表
export async function getEnabledTasks(familyCode: string): Promise<Task[]> {
  try {
    const data = await callApi<Task[]>('getTasks', { familyCode, enabledOnly: true });

    // 解密任务名
    const decrypted = await Promise.all(
      (data || []).map(async (task) => ({
        ...task,
        name: await decrypt(task.name, familyCode),
      }))
    );
    return decrypted;
  } catch (error) {
    console.error('获取启用任务列表失败:', error);
    return [];
  }
}

// 创建任务
export async function createTask(
  familyCode: string,
  task: {
    name: string;
    unit: string;
    score: number;
    type: 'positive' | 'negative';
  }
): Promise<{ success: boolean; data?: Task; error?: string }> {
  // 加密任务名
  const encryptedName = await encrypt(task.name, familyCode);

  const result = await callApiSafe<Task>('createTask', {
    familyCode,
    task: { ...task, name: encryptedName },
  });

  if (result.success && result.data) {
    // 返回解密后的数据
    return { success: true, data: { ...result.data, name: task.name } };
  }
  return { success: result.success, error: result.error };
}

// 更新任务
export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'name' | 'unit' | 'score' | 'type' | 'enabled'>>,
  familyCode?: string
): Promise<{ success: boolean; error?: string }> {
  // 如果更新name且有familyCode，则加密
  const encryptedUpdates = { ...updates };
  if (updates.name && familyCode) {
    encryptedUpdates.name = await encrypt(updates.name, familyCode);
  }

  const result = await callApiSafe('updateTask', { taskId, updates: encryptedUpdates });
  return { success: result.success, error: result.error };
}

// 切换任务启用状态
export async function toggleTaskEnabled(
  taskId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('toggleTaskEnabled', { taskId, enabled });
  return { success: result.success, error: result.error };
}

// 删除任务
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await callApiSafe('deleteTask', { taskId });
  return { success: result.success, error: result.error };
}
