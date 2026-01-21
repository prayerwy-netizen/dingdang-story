import { ClassicContent, DiaryEntry } from "../types";
import { uploadCourseImage, getCourseImageUrl, checkCourseImageExists } from "./storageService";

// 第三方中转 API 配置（Gemini 原生格式）
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_BASE_URL = import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';
const TEXT_MODEL = 'gemini-3-flash-preview-nothinking';

// MiniMax TTS API 配置
const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY || '';
const MINIMAX_GROUP_ID = import.meta.env.VITE_MINIMAX_GROUP_ID || '';
const MINIMAX_TTS_URL = `https://api.minimax.chat/v1/t2a_v2?GroupId=${MINIMAX_GROUP_ID}`;

// 图片缓存 - localStorage 作为本地缓存，云端为主存储
const IMAGE_CACHE_PREFIX = 'dingdang_img_';

// 从本地缓存获取图片（加速加载）
const getImageFromLocalCache = (contentId: string): string | null => {
  try {
    return localStorage.getItem(IMAGE_CACHE_PREFIX + contentId);
  } catch {
    return null;
  }
};

// 保存图片到本地缓存
const saveImageToLocalCache = (contentId: string, imageData: string): void => {
  try {
    localStorage.setItem(IMAGE_CACHE_PREFIX + contentId, imageData);
  } catch (e) {
    console.warn('Failed to cache image locally:', e);
    clearOldImageCache();
    try {
      localStorage.setItem(IMAGE_CACHE_PREFIX + contentId, imageData);
    } catch {
      console.warn('Still failed after clearing cache');
    }
  }
};

// 清理旧的本地图片缓存
const clearOldImageCache = (): void => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(IMAGE_CACHE_PREFIX));
  if (keys.length > 20) {
    keys.slice(0, keys.length - 20).forEach(k => localStorage.removeItem(k));
  }
};

// 从云端获取图片
const getImageFromCloud = async (contentId: string): Promise<string | null> => {
  try {
    const exists = await checkCourseImageExists(contentId);
    if (exists) {
      const url = getCourseImageUrl(contentId);
      console.log('Found image in cloud for:', contentId);
      return url;
    }
    return null;
  } catch (error) {
    console.error('Error checking cloud image:', error);
    return null;
  }
};

// 上传图片到云端
const saveImageToCloud = async (contentId: string, imageData: string): Promise<string | null> => {
  try {
    console.log('Uploading image to cloud for:', contentId);
    const result = await uploadCourseImage(contentId, imageData);
    if (result.success && result.url) {
      console.log('Image uploaded successfully:', result.url);
      return result.url;
    }
    console.error('Failed to upload image:', result.error);
    return null;
  } catch (error) {
    console.error('Error uploading image to cloud:', error);
    return null;
  }
};

// 保存图片到云端和本地缓存（新生成的图片使用）
const saveImageToCache = async (contentId: string, imageData: string): Promise<void> => {
  // 先保存到本地缓存（同步，快速）
  saveImageToLocalCache(contentId, imageData);

  // 异步上传到云端（不阻塞返回）
  saveImageToCloud(contentId, imageData).catch(err => {
    console.warn('Background cloud upload failed:', err);
  });
};

// --- Image Generation ---

export const generateIllustration = async (content: ClassicContent): Promise<string | null> => {
  // 1. 先检查本地缓存（最快）
  const localCached = getImageFromLocalCache(content.id);
  if (localCached) {
    console.log('Using local cached image for:', content.id);
    return localCached;
  }

  // 2. 检查云端存储
  const cloudImage = await getImageFromCloud(content.id);
  if (cloudImage) {
    // 云端有图片，保存到本地缓存加速下次加载
    saveImageToLocalCache(content.id, cloudImage);
    return cloudImage;
  }

  // 3. 云端也没有，需要生成新图片
  console.log('No cached image found, generating new image for:', content.id);

  // 将 phrases 转换为文字排版格式
  const pinyinLine = content.phrases.map(p => p.pinyin).join('  ');
  const textLine = content.phrases.map(p => p.text).join(' ');
  // 生成精确对应的排版示例
  const layoutExample = content.phrases.slice(0, 4).map(p =>
    `${p.pinyin}\n${p.text}`
  ).join('  ');

  const prompt = `生成一张儿童国学启蒙配图：

经典原文（词组对应）：
${content.phrases.map(p => `${p.text}(${p.pinyin})`).join(' ')}

画面内容建议：根据原文含义，描绘温馨、可爱、充满童趣的场景。

要求：
1. 风格：可爱卡通，色彩明快，适合3-6岁儿童
2. 文字排版【重要】：每个词组的拼音在上，汉字在下，严格对齐！
3. 文字位置：放在图片上方区域，清晰可读，每个词组间有适当间距
4. 背景是与内容相关的可爱插画，占据图片下方大部分区域
5. 图片比例：方形（1:1）

【严格按照以下格式排版文字】：
${pinyinLine}
${textLine}

示例（前4个词组）：
${layoutExample}

画面风格参考：可爱的小朋友形象、圆润的线条、柔和的配色`;

  try {
    const apiUrl = `${GEMINI_BASE_URL}/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    console.log('[ImageGen] Using Gemini API');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT']
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ImageGen] API error:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('[ImageGen] Response received');

    // 从 Gemini 响应中提取图片
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        const imageData = `data:${mimeType};base64,${part.inlineData.data}`;
        saveImageToCache(content.id, imageData);
        return imageData;
      }
    }

    console.log('[ImageGen] No image found in response');
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

  // 从 phrases 生成完整文本
  const fullText = content.phrases.map(p => p.text).join(' ');

  const prompt = `[角色]
你是"姐姐"，一位温柔有趣的国学启蒙老师。你专门为3-6岁的小朋友讲解中华经典。

[任务]
为${profileAge}岁的${profileName}逐句讲解以下经典，最后总结道理。

经典原文：${fullText}
孩子姓名：${profileName}
成长记录：
${diaryContext || '暂无记录'}

[讲解格式要求]
1. **开场**：用"${profileName}，姐姐给你讲故事啦！"开始
2. **逐句讲解**：把原文拆成2-4个短句，每句用简单的话解释意思
   - 格式："XXX"是什么意思呢？就是说...
3. **总结道理**：用1-2句话总结整段话教给我们的道理
4. **联系生活**：如果成长记录中有相关经历，用"${profileName}，你还记得..."把经历和道理联系起来

注意：始终用"${profileName}"称呼孩子，用"姐姐"自称，不要说"宝贝"。

你必须严格按照以下JSON格式输出，不要输出任何其他内容：
{"explanation": "完整的讲解文本（包含开场+逐句讲解+总结+联系生活）", "question": "互动问题"}

示例输出：
{"explanation": "小明，姐姐给你讲故事啦！...", "question": "如果是你，你会怎么做呢？"}

现在请输出JSON：`;

  try {
    const apiUrl = `${GEMINI_BASE_URL}/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    console.log('[LessonScript] Using Gemini API for:', profileName);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LessonScript] API error:', errorText);
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    console.log('[LessonScript] Raw response:', text.substring(0, 300));

    // 尝试解析完整 JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as LessonScript;
      } catch {
        // JSON 不完整，尝试提取 explanation 字段
        const explanationMatch = text.match(/"explanation"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
        if (explanationMatch) {
          console.log('[LessonScript] Extracted explanation from incomplete JSON');
          return {
            explanation: explanationMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
            question: "你觉得这个故事告诉我们什么道理呢？"
          };
        }
        throw new Error('JSON parse failed');
      }
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error("Error generating script:", error);
    return {
      explanation: `${profileName}，姐姐给你讲故事啦！这句话教我们要做一个诚实、守信的好孩子。`,
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
        model: 'speech-2.6-turbo',
        text: text,
        stream: false,
        timbre_weights: [
          {
            voice_id: 'Chinese (Mandarin)_Gentle_Senior',
            weight: 100
          }
        ],
        voice_setting: {
          voice_id: '',
          speed: 0.8,
          vol: 1,
          pitch: 0,
          emotion: 'happy',
          latex_read: false
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: 'mp3'
        },
        language_boost: 'auto'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax TTS error:', errorText);
      return null;
    }

    // MiniMax 返回的是 JSON，包含十六进制编码的音频
    const json = await response.json();

    // 检查是否有错误
    if (json.base_resp?.status_code !== 0 && json.base_resp?.status_code !== undefined) {
      console.error('MiniMax TTS API error:', json.base_resp);
      return null;
    }

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
    console.log('Audio playback ended');
    URL.revokeObjectURL(url);
    onEnd?.();
  };

  audio.onerror = (e) => {
    console.error('Audio playback error:', e);
    URL.revokeObjectURL(url);
    onEnd?.();
  };

  // 移动端需要处理 play() 返回的 Promise
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('Audio playback started successfully');
      })
      .catch((error) => {
        console.error('Audio play failed:', error);
        // 播放失败时也要调用 onEnd
        URL.revokeObjectURL(url);
        onEnd?.();
      });
  }

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
    const apiUrl = `${GEMINI_BASE_URL}/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    console.log('[AudioAnalysis] Using Gemini API');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: audioBlob.type,
                data: base64Audio
              }
            },
            { text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AudioAnalysis] API error:', errorText);
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || `说得真棒，${profileName}！送你一朵小红花！`;

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
