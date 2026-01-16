import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { speakWithMiniMax, stopSpeaking } from '../services/geminiService';

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

// 全局标记：用户是否已经交互过（整个会话中只需要一次）
let globalHasUserInteracted = false;

// 解锁音频播放（iOS 需要在用户交互时触发）
const unlockAudio = () => {
  if (globalHasUserInteracted) return;
  globalHasUserInteracted = true;

  // 创建并播放一个静音音频来解锁 AudioContext
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      ctx.resume();
    }
  } catch (e) {
    console.log('Audio unlock failed:', e);
  }
};

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(({ audioBuffer, text, preloadedAudio, autoPlay, onEnded }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needUserInteraction, setNeedUserInteraction] = useState(false);
  const cachedAudioRef = useRef<ArrayBuffer | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // 如果有预加载的音频，直接使用
  useEffect(() => {
    if (preloadedAudio) {
      cachedAudioRef.current = preloadedAudio;
    }
  }, [preloadedAudio]);

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

  // 播放缓存的音频
  const playCachedAudio = (audioData: ArrayBuffer) => {
    const blob = new Blob([audioData], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioElementRef.current = audio;

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

    // 移动端需要处理 play() 返回的 Promise
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // 播放成功
        })
        .catch(() => {
          URL.revokeObjectURL(url);
          setIsPlaying(false);
          onEnded?.();
        });
    }
  };

  const playAudio = async () => {
    if (!text) return;

    // 标记用户已经交互过，解锁音频播放
    unlockAudio();
    setNeedUserInteraction(false);

    stopSpeaking();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    // 如果有缓存，直接播放
    if (cachedAudioRef.current) {
      setIsPlaying(true);
      playCachedAudio(cachedAudioRef.current);
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);

    try {
      await speakWithMiniMax(text, () => {
        setIsPlaying(false);
        setIsLoading(false);
        onEnded?.();
      }, (audioData) => {
        // 缓存音频数据
        cachedAudioRef.current = audioData;
      });
    } catch (e) {
      console.error('Audio playback error:', e);
    }

    setIsLoading(false);
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
