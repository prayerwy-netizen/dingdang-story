import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ClassicContent, DiaryEntry } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// 第三方中转 API 配置（已禁用，全部使用原生 Gemini）
const USE_PROXY_API = false;

// MiniMax TTS API 配置
const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY || '';
const MINIMAX_TTS_URL = 'https://api.minimaxi.com/v1/t2a_v2';

// 图片缓存 - 使用 localStorage 持久化存储
const IMAGE_CACHE_PREFIX = 'dingdang_img_';

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
    // localStorage 满了，清理旧缓存
    console.warn('Failed to cache image, clearing old cache:', e);
    clearOldImageCache();
    try {
      localStorage.setItem(IMAGE_CACHE_PREFIX + contentId, imageData);
    } catch {
      console.warn('Still failed after clearing cache');
    }
  }
};

// 清理旧的图片缓存
const clearOldImageCache = (): void => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(IMAGE_CACHE_PREFIX));
  // 保留最新的 10 张，删除其他的
  if (keys.length > 10) {
    keys.slice(0, keys.length - 10).forEach(k => localStorage.removeItem(k));
  }
};

// --- Image Generation ---

export const generateIllustration = async (content: ClassicContent): Promise<string | null> => {
  // 检查缓存
  const cachedImage = getImageFromCache(content.id);
  if (cachedImage) {
    console.log('Using cached image for:', content.id);
    return cachedImage;
  }

  const prompt = `生成一张儿童国学启蒙配图：

经典原文：${content.text}
拼音：${content.pinyin}

画面内容建议：根据原文含义，描绘温馨、可爱、充满童趣的场景。

要求：
1. 风格：可爱卡通，色彩明快，适合3-6岁儿童
2. 文字排版：拼音在上，汉字在下（每个汉字上方对应其拼音）
3. 文字位置：放在图片上方区域，清晰可读
4. 背景是与内容相关的可爱插画，占据图片下方大部分区域
5. 整体温馨、充满童趣
6. 图片比例：方形（1:1）

文字排版示例：
chūn mián bù jué xiǎo
春   眠   不  觉  晓

画面风格参考：可爱的小朋友形象、圆润的线条、柔和的配色`;

  try {
    // 优先使用中转 API
    if (USE_PROXY_API) {
      console.log('Using proxy API for image generation...');

      // 尝试使用 /images/generations 端点（DALL-E 格式）
      try {
        const imageResponse = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: PROXY_IMAGE_MODEL,
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
          })
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          console.log('Image generation response:', imageData);

          // DALL-E 格式: {data: [{b64_json: '...'}]}
          if (imageData.data?.[0]?.b64_json) {
            const base64Image = `data:image/png;base64,${imageData.data[0].b64_json}`;
            saveImageToCache(content.id, base64Image);
            return base64Image;
          }
          // URL 格式: {data: [{url: '...'}]}
          if (imageData.data?.[0]?.url) {
            saveImageToCache(content.id, imageData.data[0].url);
            return imageData.data[0].url;
          }
        } else {
          console.log('Images endpoint failed, trying chat completions...');
        }
      } catch (e) {
        console.log('Images endpoint error:', e);
      }

      // 降级尝试 /chat/completions 端点
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: PROXY_IMAGE_MODEL,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Proxy image API error:', errorText);
        throw new Error('Proxy image API failed');
      }

      const data = await response.json();
      console.log('Proxy chat image response:', JSON.stringify(data, null, 2));

      // 尝试从响应中提取图片
      const message = data.choices?.[0]?.message;
      const content_parts = message?.content;

      // 格式1: content 是数组（多模态响应）
      if (Array.isArray(content_parts)) {
        for (const part of content_parts) {
          // OpenAI 格式: {type: 'image_url', image_url: {url: 'data:...'}}
          if (part.type === 'image_url' && part.image_url?.url) {
            saveImageToCache(content.id, part.image_url.url);
            return part.image_url.url;
          }
          // Gemini 格式: {inline_data: {data: '...', mime_type: '...'}}
          if (part.inline_data?.data) {
            const mimeType = part.inline_data.mime_type || 'image/png';
            const imageData = `data:${mimeType};base64,${part.inline_data.data}`;
            saveImageToCache(content.id, imageData);
            return imageData;
          }
          // 其他格式: {type: 'image', data: '...'}
          if (part.type === 'image' && part.data) {
            const imageData = part.data.startsWith('data:') ? part.data : `data:image/png;base64,${part.data}`;
            saveImageToCache(content.id, imageData);
            return imageData;
          }
        }
      }

      // 格式2: content 是字符串
      if (typeof content_parts === 'string') {
        // 直接是 data URL
        if (content_parts.startsWith('data:image')) {
          saveImageToCache(content.id, content_parts);
          return content_parts;
        }
        // 纯 base64 字符串（长度大于1000且不含空格）
        if (content_parts.length > 1000 && !content_parts.includes(' ')) {
          const imageData = `data:image/png;base64,${content_parts}`;
          saveImageToCache(content.id, imageData);
          return imageData;
        }
        // 即梦图片格式: ![image_0](https://...)
        const markdownImageMatch = content_parts.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
        if (markdownImageMatch) {
          const imageUrl = markdownImageMatch[1];
          console.log('Found image URL from jimeng:', imageUrl);
          saveImageToCache(content.id, imageUrl);
          return imageUrl;
        }
        // 直接是 URL
        if (content_parts.startsWith('http')) {
          saveImageToCache(content.id, content_parts);
          return content_parts;
        }
      }

      console.log('Proxy image generation failed, falling back to native Gemini API...');
    }

    // 降级使用原生 Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const imageData = `data:image/png;base64,${part.inlineData.data}`;
        saveImageToCache(content.id, imageData);
        return imageData;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating illustration:", error);
    return null;
  }
};

// --- Text Generation (Explanation & Q/A) ---

interface LessonScript {
  explanation: string;
  question: string;
}

export const generateLessonScript = async (
  content: ClassicContent,
  profileName: string,
  profileAge: number,
  diaries: DiaryEntry[]
): Promise<LessonScript> => {

  // Convert diaries to string context
  const diaryContext = diaries.map(d => `[${d.date}] ${d.content}`).join('\n');

  const prompt = `[角色]
你是"叮当姐姐"，一位温柔有趣的国学启蒙老师。你专门为3-6岁的小朋友讲解中华经典。

[任务]
为${profileAge}岁的${profileName}逐句讲解以下经典，最后总结道理。

经典原文：${content.text}
孩子姓名：${profileName}
成长记录：
${diaryContext || '暂无记录'}

[讲解格式要求]
1. **逐句讲解**：把原文拆成2-4个短句，每句用简单的话解释意思
   - 格式："XXX"是什么意思呢？就是说...
2. **总结道理**：用1-2句话总结整段话教给我们的道理
3. **联系生活**：如果成长记录中有相关经历，用"${profileName}，你还记得..."把经历和道理联系起来

请输出一个JSON对象，包含以下字段：
- explanation: 完整的讲解文本（包含逐句讲解+总结+联系生活）
- question: 互动问题。引导孩子思考的开放式问题。

返回格式必须是纯JSON。`;

  try {
    // 优先使用中转 API
    if (USE_PROXY_API) {
      console.log('Using proxy API for lesson script...');
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: PROXY_TEXT_MODEL,
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
        console.error('Proxy API error:', errorText);
        throw new Error('Proxy API request failed');
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '{}';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as LessonScript;
      }
      throw new Error('Invalid JSON response');
    }

    // 使用原生 Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            question: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as LessonScript;
  } catch (error) {
    console.error("Error generating script:", error);
    return {
      explanation: `宝贝${profileName}，这句话的意思是我们要听爸爸妈妈的话。`,
      question: "如果是你，你会怎么做呢？"
    };
  }
};

// --- MiniMax Text to Speech ---

export const generateSpeechMiniMax = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(MINIMAX_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'speech-2.6-hd',
        text: text,
        stream: false,
        voice_setting: {
          voice_id: 'Sweet_Girl', // 甜美女孩
          speed: 0.9,
          vol: 1,
          pitch: 0,
          emotion: 'happy'
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: 'mp3',
          channel: 1
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax TTS error:', errorText);
      return null;
    }

    // MiniMax 返回的是 JSON，包含十六进制编码的音频
    const json = await response.json();
    if (json.data?.audio) {
      // 将十六进制字符串转换为 ArrayBuffer
      const hexString = json.data.audio;
      const bytes = new Uint8Array(hexString.length / 2);
      for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
      }
      return bytes.buffer;
    }

    console.error('MiniMax TTS: No audio data in response', json);
    return null;
  } catch (error) {
    console.error('Error calling MiniMax TTS:', error);
    return null;
  }
};

// 播放 MiniMax 生成的音频
export const playMiniMaxAudio = (audioData: ArrayBuffer, onEnd?: () => void): HTMLAudioElement => {
  const blob = new Blob([audioData], { type: 'audio/mp3' });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  audio.onended = () => {
    URL.revokeObjectURL(url);
    onEnd?.();
  };

  audio.onerror = () => {
    URL.revokeObjectURL(url);
    onEnd?.();
  };

  audio.play();
  return audio;
};

// 停止音频播放
let currentAudio: HTMLAudioElement | null = null;

// 格式化文本用于 TTS，添加正确的断句
const formatTextForTTS = (text: string): string => {
  // 1. 将中文字符之间的空格替换为逗号+空格，确保正确断句
  // 例如："父母呼 应勿缓" → "父母呼， 应勿缓"
  let formatted = text.replace(/([一-龥])\s+([一-龥])/g, '$1， $2');

  // 2. 确保逗号后有空格（增强断句效果）
  formatted = formatted.replace(/，(?!\s)/g, '， ');

  // 3. 确保句号后有空格
  formatted = formatted.replace(/。(?!\s)/g, '。 ');

  return formatted;
};

export const speakWithMiniMax = async (
  text: string,
  onEnd?: () => void,
  onAudioGenerated?: (audioData: ArrayBuffer) => void
): Promise<void> => {
  // 停止之前的音频
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // 格式化文本，添加正确断句
  const formattedText = formatTextForTTS(text);
  console.log('TTS text:', formattedText);

  // 使用 MiniMax TTS
  const audioData = await generateSpeechMiniMax(formattedText);
  if (audioData && audioData.byteLength > 1000) {
    // 回调返回音频数据用于缓存
    onAudioGenerated?.(audioData);
    currentAudio = playMiniMaxAudio(audioData, onEnd);
    return;
  }

  // 降级到浏览器语音
  console.log('MiniMax TTS failed, falling back to browser speech');
  speakText(formattedText, onEnd);
};

export const stopSpeaking = (): void => {
  // 停止 MiniMax 音频
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  // 停止浏览器语音
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// 浏览器内置语音合成
export const speakText = (text: string, onEnd?: () => void): void => {
  if (!('speechSynthesis' in window)) {
    console.error('浏览器不支持语音合成');
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // 更慢，更清晰
    utterance.pitch = 1.15; // 稍高，更温柔
    utterance.volume = 1.0;

    // 获取最佳中文女声
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = [
      'Tingting', 'Ting-Ting', // macOS 中文女声
      'Microsoft Xiaoxiao', 'Xiaoxiao', // Windows 中文女声
      'Google 普通话', 'Google Mandarin',
    ];

    let selectedVoice = null;
    for (const preferred of preferredVoices) {
      selectedVoice = voices.find(v => v.name.includes(preferred));
      if (selectedVoice) break;
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('zh-CN'))
        || voices.find(v => v.lang.includes('zh'))
        || voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using voice:', selectedVoice.name);
    }

    utterance.onend = () => onEnd?.();
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  // 确保语音列表已加载
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      speak();
      window.speechSynthesis.onvoiceschanged = null;
    };
  } else {
    speak();
  }
};

// 保留原有的 generateSpeech（不再使用，仅作备用）
export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  return null; // 已改用 MiniMax
};

// --- Audio Transcription (Feedback Analysis) ---

export const analyzeAnswerAndEncourage = async (
  audioBlob: Blob,
  question: string,
  profileName: string
): Promise<string> => {
  const prompt = `问题：${question}
${profileName}的回答：（请参考音频内容）

给${profileName}正向反馈：
1. 无论回答什么，都要肯定和鼓励。
2. 语气温暖，像夸奖自己的孩子。
3. 最后加上小红花奖励："送你一朵小红花！"
4. 控制在2-3句话。`;

  try {
    const base64Audio = await blobToBase64(audioBlob);

    // 优先使用中转 API
    if (USE_PROXY_API) {
      console.log('Using proxy API for audio analysis...');
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: PROXY_TEXT_MODEL,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_audio',
                  input_audio: {
                    data: base64Audio,
                    format: audioBlob.type.includes('webm') ? 'webm' : 'wav'
                  }
                },
                {
                  type: 'text',
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Proxy audio API error:', errorText);
        throw new Error('Proxy audio API failed');
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        return text;
      }
      throw new Error('No text in proxy response');
    }

    // 使用原生 Gemini API
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: audioBlob.type,
                        data: base64Audio
                    }
                },
                { text: prompt }
            ]
        }
    });

    return response.text || `说得真棒，${profileName}！送你一朵小红花！`;

  } catch (error) {
    console.error("Error analyzing answer:", error);
    return `说得真棒，${profileName}！送你一朵小红花！`;
  }
};


// --- Helpers ---

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
