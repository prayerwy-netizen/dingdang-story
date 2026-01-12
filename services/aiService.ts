/**
 * 统一 AI 服务接口
 * 支持切换不同的 AI 提供商：Gemini、火山引擎
 */

import { ClassicContent, DiaryEntry, AIProvider } from "../types";

// Gemini 服务
import {
  generateIllustration as generateIllustrationGemini,
  generateLessonScript as generateLessonScriptGemini,
  analyzeAnswerAndEncourage as analyzeAnswerGemini,
  speakWithMiniMax,
  stopSpeaking,
  speakText
} from './geminiService';

// 火山引擎服务
import {
  generateIllustrationVolc,
  generateLessonScriptVolc,
  analyzeAnswerVolc,
  isVolcConfigured
} from './volcengineService';

// 当前 AI 提供商设置
const AI_PROVIDER_KEY = 'dingdang_ai_provider';

export const getAIProvider = (): AIProvider => {
  try {
    const saved = localStorage.getItem(AI_PROVIDER_KEY);
    if (saved === 'volcengine' || saved === 'gemini') {
      return saved;
    }
  } catch {}
  return 'gemini'; // 默认使用 Gemini
};

export const setAIProvider = (provider: AIProvider): void => {
  try {
    localStorage.setItem(AI_PROVIDER_KEY, provider);
  } catch (e) {
    console.warn('Failed to save AI provider:', e);
  }
};

// 检查提供商是否可用
export const isProviderAvailable = (provider: AIProvider): boolean => {
  if (provider === 'gemini') {
    return !!import.meta.env.VITE_GEMINI_API_KEY;
  }
  if (provider === 'volcengine') {
    return isVolcConfigured();
  }
  return false;
};

// --- 统一接口 ---

interface LessonScript {
  explanation: string;
  question: string;
}

/**
 * 生成课程配图
 */
export const generateIllustration = async (content: ClassicContent): Promise<string | null> => {
  const provider = getAIProvider();
  console.log(`Generating illustration with ${provider}...`);

  if (provider === 'volcengine') {
    try {
      const result = await generateIllustrationVolc(content);
      if (result) return result;
      console.log('Volcengine image failed, falling back to Gemini');
    } catch (e) {
      console.log('Volcengine image error, falling back to Gemini', e);
    }
  }

  return generateIllustrationGemini(content);
};

/**
 * 生成课程脚本（讲解 + 问题）
 */
export const generateLessonScript = async (
  content: ClassicContent,
  profileName: string,
  profileAge: number,
  diaries: DiaryEntry[]
): Promise<LessonScript> => {
  const provider = getAIProvider();
  console.log(`Generating lesson script with ${provider}...`);

  if (provider === 'volcengine') {
    try {
      return await generateLessonScriptVolc(content, profileName, profileAge, diaries);
    } catch (e) {
      console.log('Volcengine failed, falling back to Gemini', e);
    }
  }

  return generateLessonScriptGemini(content, profileName, profileAge, diaries);
};

/**
 * 分析回答并生成鼓励
 */
export const analyzeAnswerAndEncourage = async (
  audioBlob: Blob,
  question: string,
  profileName: string
): Promise<string> => {
  const provider = getAIProvider();
  console.log(`Analyzing answer with ${provider}...`);

  if (provider === 'volcengine') {
    try {
      return await analyzeAnswerVolc(audioBlob, question, profileName);
    } catch (e) {
      console.log('Volcengine failed, falling back to Gemini', e);
    }
  }

  return analyzeAnswerGemini(audioBlob, question, profileName);
};

/**
 * 语音合成（始终使用 MiniMax，效果最好）
 */
export const speak = speakWithMiniMax;
export const stop = stopSpeaking;
export const speakFallback = speakText;

/**
 * 获取提供商显示名称
 */
export const getProviderDisplayName = (provider: AIProvider): string => {
  const names: Record<AIProvider, string> = {
    gemini: 'Google Gemini',
    volcengine: '火山引擎（豆包）'
  };
  return names[provider] || provider;
};

/**
 * 获取所有可用的提供商
 */
export const getAvailableProviders = (): { id: AIProvider; name: string; available: boolean }[] => {
  return [
    {
      id: 'gemini',
      name: 'Google Gemini',
      available: isProviderAvailable('gemini')
    },
    {
      id: 'volcengine',
      name: '火山引擎（豆包）',
      available: isProviderAvailable('volcengine')
    }
  ];
};
