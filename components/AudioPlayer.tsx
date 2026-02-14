import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { generateSpeechMiniMax, formatTextForTTS, stopSpeaking, speakText } from '../services/geminiService';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  text?: string; // 文本，用于 MiniMax 语音合成
  preloadedAudio?: ArrayBuffer | null; // 预加载的音频数据
  autoPlay?: boolean;
  onEnded?: () => void;
}

export interface AudioPlayerHandle {
  play: () => void;
  stop: () => void;
}

// 检测是否是移动设备（iOS/Android）
const isMobileDevice = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// 极小的静音 mp3（用于在用户手势中解锁 Audio 元素）
const SILENT_MP3 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqpAAAAAAD/+1DEAAAGAAGn9AAAIgAANP8AAABMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UMQbg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

// 全局标记：用户是否已经交互过
let globalHasUserInteracted = false;

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(({ audioBuffer, text, preloadedAudio, autoPlay, onEnded }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needUserInteraction, setNeedUserInteraction] = useState(false);
  const cachedAudioRef = useRef<ArrayBuffer | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  // 当 text 变化时，清除缓存，重置状态
  useEffect(() => {
    cachedAudioRef.current = null;
    setNeedUserInteraction(false);
  }, [text]);

  // 如果有预加载的音频，直接使用（必须在 text effect 之后，避免被清除）
  useEffect(() => {
    if (preloadedAudio) {
      cachedAudioRef.current = preloadedAudio;
    }
  }, [preloadedAudio]);

  useEffect(() => {
    if (autoPlay && text) {
      // 在移动设备上，如果还没有用户交互过，显示点击按钮
      if (isMobileDevice() && !globalHasUserInteracted) {
        setNeedUserInteraction(true);
      } else {
        const timer = setTimeout(() => playAudio(), 100);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // 在 Audio 元素上播放 ArrayBuffer 音频数据
  const playOnElement = (audio: HTMLAudioElement, audioData: ArrayBuffer) => {
    const blob = new Blob([audioData], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);

    audio.onended = () => {
      URL.revokeObjectURL(url);
      setIsPlaying(false);
      onEnded?.();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      setIsPlaying(false);
      onEnded?.();
    };

    audio.src = url;
    audio.play().catch((err) => {
      console.error('Audio play failed:', err);
      URL.revokeObjectURL(url);
      setIsPlaying(false);
      // 降级到浏览器语音
      if (text) {
        speakText(formatTextForTTS(text), onEnded);
      } else {
        onEnded?.();
      }
    });
  };

  const playAudio = async () => {
    if (!text) return;

    globalHasUserInteracted = true;
    setNeedUserInteraction(false);

    // 停止之前的播放
    stopSpeaking();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    // 关键：在用户手势上下文中立即创建 Audio 元素并播放静音音频
    // 这样后续可以复用这个已"解锁"的元素播放真实音频
    const audio = new Audio();
    audioElementRef.current = audio;

    if (isMobileDevice()) {
      audio.src = SILENT_MP3;
      try {
        await audio.play();
      } catch {
        // 静音播放失败也继续，不影响后续逻辑
      }
    }

    // 优先使用预加载音频（props直接读取），其次用缓存
    const audioToPlay = preloadedAudio || cachedAudioRef.current;
    if (audioToPlay) {
      cachedAudioRef.current = audioToPlay;
      setIsPlaying(true);
      playOnElement(audio, audioToPlay);
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);

    try {
      const formattedText = formatTextForTTS(text);
      const audioData = await generateSpeechMiniMax(formattedText);

      if (audioData && audioData.byteLength > 1000) {
        // 缓存音频数据
        cachedAudioRef.current = audioData;
        // 在已解锁的 Audio 元素上播放
        playOnElement(audio, audioData);
        setIsLoading(false);
      } else {
        // MiniMax 失败，降级到浏览器语音
        console.log('MiniMax TTS failed, falling back to browser speech');
        setIsLoading(false);
        setIsPlaying(true);
        speakText(formattedText, () => {
          setIsPlaying(false);
          onEnded?.();
        });
      }
    } catch (e) {
      console.error('Audio playback error:', e);
      setIsLoading(false);
      setIsPlaying(false);
      onEnded?.();
    }
  };

  const stopAudio = () => {
    stopSpeaking();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  useImperativeHandle(ref, () => ({
    play: playAudio,
    stop: stopAudio
  }));

  if (!text) return null;

  // iOS/移动设备首次需要用户点击才能播放音频
  if (needUserInteraction) {
    return (
      <div className="flex justify-center mt-4">
        <button
          onClick={playAudio}
          className="px-6 py-3 rounded-full flex items-center gap-2 bg-accent-orange text-white font-semibold shadow-lg animate-pulse cursor-pointer"
        >
          <span className="text-xl">🔊</span> 点击开始播放
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-4">
      <button
        onClick={isPlaying ? stopAudio : playAudio}
        disabled={isLoading}
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors cursor-pointer ${
          isPlaying ? 'bg-orange-100 text-orange-600' : 'bg-primary-500 text-white'
        } ${isLoading ? 'opacity-70' : ''}`}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span> 加载中...
          </>
        ) : isPlaying ? (
          <>
            <span className="animate-pulse">🔊</span> 播放中...
          </>
        ) : (
          <>
            <span>▶️</span> 再听一遍
          </>
        )}
      </button>
    </div>
  );
});

export default AudioPlayer;
