/**
 * Edge Function API 调用服务
 * 所有数据库操作都通过这个服务调用 Edge Function
 * 不再直接使用 Supabase 客户端访问数据库
 */

import { supabase } from './supabase';

/**
 * 调用 Edge Function API
 * @param action 操作名称
 * @param params 参数
 * @returns 返回结果
 */
export async function callApi<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('api', {
    body: { action, params },
  });

  if (error) {
    console.error(`API 调用失败 [${action}]:`, error);
    throw new Error(error.message || '请求失败');
  }

  return data as T;
}

/**
 * 带错误处理的 API 调用
 * 返回 { success, data, error } 格式
 */
export async function callApiSafe<T = unknown>(
  action: string,
  params: Record<string, unknown> = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await callApi<T>(action, params);

    // 如果返回的数据本身包含 success 字段，直接返回
    if (data && typeof data === 'object' && 'success' in data) {
      return data as { success: boolean; data?: T; error?: string };
    }

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误'
    };
  }
}
