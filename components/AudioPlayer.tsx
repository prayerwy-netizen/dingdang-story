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

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(({ audioBuffer, text, autoPlay, onEnded }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // 当 text 变化时，清除缓存
  useEffect(() => {
    cachedAudioRef.current = null;
  }, [text]);

  useEffect(() => {
    if (autoPlay && text) {
      const timer = setTimeout(() => playAudio(), 100);
      return () => clearTimeout(timer);
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
    setIsPlaying(false);
    setIsLoading(false);
  };

  useImperativeHandle(ref, () => ({
    play: playAudio,
    stop: stopAudio
  }));

  if (!text) return null;

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
