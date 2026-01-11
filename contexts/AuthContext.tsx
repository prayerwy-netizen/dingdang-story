import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { onAuthStateChange, getCurrentUser, signInAnonymously } from '../services/authService';
import { getProfile, type Profile } from '../services/profileService';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载用户资料
  const loadProfile = useCallback(async (userId: string) => {
    const profileData = await getProfile(userId);
    setProfile(profileData);
  }, []);

  // 刷新用户资料
  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    // 初始化：检查现有会话或创建匿名会话
    const initAuth = async () => {
      try {
        // 先检查是否有现有用户
        const currentUser = await getCurrentUser();

        if (currentUser) {
          // 有现有会话，直接使用
          setUser(currentUser);
          await loadProfile(currentUser.id);
        } else {
          // 没有会话，自动匿名登录
          console.log('自动创建匿名账号...');
          const result = await signInAnonymously();
          if (result.success && result.user) {
            setUser(result.user);
            await loadProfile(result.user.id);
          }
        }
      } catch (error) {
        console.error('认证初始化失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 监听认证状态变化
    const { data: { subscription } } = onAuthStateChange(async (newUser, newSession) => {
      setUser(newUser);
      setSession(newSession);

      if (newUser) {
        await loadProfile(newUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
