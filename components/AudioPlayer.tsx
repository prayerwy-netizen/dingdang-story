import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { speakWithMiniMax, stopSpeaking } from '../services/geminiService';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  text?: string; // 文本，用于 MiniMax 语音合成
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

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(({ audioBuffer, text, autoPlay, onEnded }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needUserInteraction, setNeedUserInteraction] = useState(false);
  const cachedAudioRef = useRef<ArrayBuffer | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const hasUserInteracted = useRef(false);

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
      if (isMobileDevice() && !hasUserInteracted.current) {
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

    audio.play();
  };

  const playAudio = async () => {
    if (!text) return;

    // 标记用户已经交互过
    hasUserInteracted.current = true;
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

    await speakWithMiniMax(text, () => {
      setIsPlaying(false);
      setIsLoading(false);
      onEnded?.();
    }, (audioData) => {
      // 缓存音频数据
      cachedAudioRef.current = audioData;
    });

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
    <div className="flex justify-center mt-4">
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
