/**
 * 火山引擎 AI 服务
 * - 豆包大模型：文本生成
 * - 图片生成：Volcengine Visual
 */

import { ClassicContent, DiaryEntry } from "../types";

// 火山引擎配置
const VOLC_API_KEY = import.meta.env.VITE_VOLC_API_KEY || '';
const VOLC_TEXT_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const VOLC_IMAGE_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

// 豆包模型接入点 ID
const DOUBAO_MODEL_ID = import.meta.env.VITE_DOUBAO_MODEL_ID || '';
const DOUBAO_IMAGE_MODEL_ID = import.meta.env.VITE_DOUBAO_IMAGE_MODEL_ID || '';

// 图片缓存
const IMAGE_CACHE_PREFIX = 'dingdang_volc_img_';

const getImageFromCache = (contentId: string): string | null => {
  try {
    return localStorage.getItem(IMAGE_CACHE_PREFIX + contentId);
  } catch {
    return null;
  }
};

const saveImageToCache = (contentId: string, imageData: string): void => {
  try {
    localStorage.setItem(IMAGE_CACHE_PREFIX + contentId, imageData);
  } catch (e) {
    console.warn('Failed to cache image:', e);
  }
};

// 脚本缓存
const SCRIPT_CACHE_PREFIX = 'dingdang_volc_script_';

const getScriptFromCache = (contentId: string): { explanation: string; question: string } | null => {
  try {
    const cached = localStorage.getItem(SCRIPT_CACHE_PREFIX + contentId);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const saveScriptToCache = (contentId: string, script: { explanation: string; question: string }): void => {
  try {
    localStorage.setItem(SCRIPT_CACHE_PREFIX + contentId, JSON.stringify(script));
  } catch (e) {
    console.warn('Failed to cache script:', e);
  }
};

// --- 文本生成（豆包大模型）---

interface LessonScript {
  explanation: string;
  question: string;
}

export const generateLessonScriptVolc = async (
  content: ClassicContent,
  profileName: string,
  profileAge: number,
  diaries: DiaryEntry[]
): Promise<LessonScript> => {
  // 检查缓存
  const cached = getScriptFromCache(content.id);
  if (cached) {
    console.log('Using cached script (Volc) for:', content.id);
    return cached;
  }

  const diaryContext = diaries.slice(0, 5).map(d => `[${d.date}] ${d.content}`).join('\n');

  const prompt = `[角色]
你是"姐姐"，一位温柔有趣的国学启蒙老师。你专门为3-6岁的小朋友讲解中华经典。

[任务]
1. 为${profileAge}岁的${profileName}讲解以下经典。
2. 尝试从孩子的成长记录中找到关联经历。
3. 提出一个互动问题。

经典原文：${content.text}
孩子姓名：${profileName}
成长记录：
${diaryContext || '暂无记录'}

请输出一个JSON对象，包含以下字段：
- explanation: 讲解文本。用"${profileName}，姐姐给你讲故事啦！"开头，然后用白话解释意思（3-5句）。如果成长记录中有相关经历，请用"${profileName}，你还记得..."把经历和道理联系起来。
- question: 互动问题。引导孩子思考的开放式问题。

注意：始终用"${profileName}"称呼孩子，用"姐姐"自称，不要说"宝贝"或"叮当姐姐"。

返回格式必须是纯JSON。`;

  try {
    const response = await fetch(VOLC_TEXT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOLC_API_KEY}`
      },
      body: JSON.stringify({
        model: DOUBAO_MODEL_ID,
        messages: [
          { role: 'system', content: '你是一个儿童国学启蒙助手，输出格式必须是纯JSON。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Volcengine text API error:', errorText);
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';

    // 尝试解析 JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const script = JSON.parse(jsonMatch[0]) as LessonScript;
      saveScriptToCache(content.id, script);
      return script;
    }

    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('Error generating script (Volc):', error);
    return {
      explanation: `${profileName}，姐姐给你讲故事啦！这句话的意思是我们要听爸爸妈妈的话，做个懂事的好孩子。`,
      question: "如果是你，你会怎么做呢？"
    };
  }
};

// --- 图片生成（火山引擎方舟 Doubao-Seedream）---

export const generateIllustrationVolc = async (content: ClassicContent): Promise<string | null> => {
  // 检查是否配置了图片模型
  if (!DOUBAO_IMAGE_MODEL_ID) {
    console.log('Doubao image model not configured, skipping');
    return null;
  }

  // 检查缓存
  const cachedImage = getImageFromCache(content.id);
  if (cachedImage) {
    console.log('Using cached image (Volc) for:', content.id);
    return cachedImage;
  }

  const prompt = `生成一张儿童国学启蒙学习卡片：

经典原文：${content.text}
拼音：${content.pinyin}

要求：
1. 风格：可爱卡通，色彩明快，适合3-6岁儿童
2. 文字排版：图片上方区域显示拼音和汉字，拼音在上，汉字在下，每个汉字上方对应其拼音
3. 背景是与内容相关的可爱插画，占据图片下方大部分区域
4. 整体温馨、充满童趣，圆润线条
5. 方形构图`;

  try {
    const response = await fetch(VOLC_IMAGE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOLC_API_KEY}`
      },
      body: JSON.stringify({
        model: DOUBAO_IMAGE_MODEL_ID,
        prompt: prompt,
        size: '1920x1920',
        response_format: 'b64_json'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Volcengine image API error:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('Volcengine image response:', data);

    // 方舟图片 API 返回格式
    if (data.data?.[0]?.b64_json) {
      const imageData = `data:image/png;base64,${data.data[0].b64_json}`;
      saveImageToCache(content.id, imageData);
      return imageData;
    } else if (data.data?.[0]?.url) {
      // 如果返回 URL
      const imageUrl = data.data[0].url;
      saveImageToCache(content.id, imageUrl);
      return imageUrl;
    }

    console.error('Volcengine image: No image data in response', data);
    return null;
  } catch (error) {
    console.error('Error generating illustration (Volc):', error);
    return null;
  }
};

// --- 语音识别（火山引擎 ASR）---
// 注意：语音合成仍使用 MiniMax，因为其儿童声音效果更好

export const analyzeAnswerVolc = async (
  audioBlob: Blob,
  question: string,
  profileName: string
): Promise<string> => {
  // 火山引擎的音频分析需要先转录再分析
  // 这里简化处理，直接用豆包生成鼓励语

  try {
    const response = await fetch(VOLC_TEXT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOLC_API_KEY}`
      },
      body: JSON.stringify({
        model: DOUBAO_MODEL_ID,
        messages: [
          {
            role: 'system',
            content: '你是姐姐，要用温暖的语气鼓励小朋友。回复2-3句话，最后说"送你一朵小红花！"用孩子的名字称呼他，自称"姐姐"。'
          },
          {
            role: 'user',
            content: `小朋友${profileName}回答了问题"${question}"，请给予正向鼓励。`
          }
        ],
        temperature: 0.8,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || `说得真棒，${profileName}！送你一朵小红花！`;
  } catch (error) {
    console.error('Error analyzing answer (Volc):', error);
    return `说得真棒，${profileName}！送你一朵小红花！`;
  }
};

// --- 辅助函数 ---

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 检查火山引擎配置是否完整
export const isVolcConfigured = (): boolean => {
  return !!VOLC_API_KEY;
};
