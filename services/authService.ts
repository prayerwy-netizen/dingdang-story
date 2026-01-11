import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// 匿名登录 - 自动创建匿名账号
export async function signInAnonymously(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('匿名登录失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user ?? undefined };
  } catch (err) {
    console.error('匿名登录异常:', err);
    return { success: false, error: '登录失败，请重试' };
  }
}

// 退出登录
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: '退出登录失败' };
  }
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// 获取当前会话
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// 监听认证状态变化
export function onAuthStateChange(
  callback: (user: User | null, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null, session);
  });
}
