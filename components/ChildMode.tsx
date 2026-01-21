import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { ChildProfile, ClassicContent, DiaryEntry, ChildView } from '../types';
import { CATEGORY_INFO } from '../constants';
import { generateIllustration, generateLessonScript, analyzeAnswerAndEncourage } from '../services/aiService';
import { generateSpeech, generateSpeechMiniMax } from '../services/geminiService';
import { getTotalScore } from '../services/recordService';
import AudioPlayer, { AudioPlayerHandle } from './AudioPlayer';
import Recorder from './Recorder';
import PointsDashboard from './PointsDashboard';
import GiftShop from './GiftShop';
import MyRecords from './MyRecords';
import PinyinText from './PinyinText';
import {
  HomeIcon,
  BookIcon,
  LockIcon,
  GiftIcon,
  ListIcon,
  ChevronLeftIcon,
  DownloadIcon,
  RefreshIcon,
  ChevronRightIcon,
} from './Icons';
import { useToast } from '../contexts/ToastContext';

interface ChildModeProps {
  profile: ChildProfile;
  diaries: DiaryEntry[];
  allContents: ClassicContent[];
  todayContent: ClassicContent;
  yesterdayContent: ClassicContent;
  familyCode: string;
  onUpdateProfile: (updates: Partial<ChildProfile>) => void;
  onOpenParentGate: () => void;
  onMarkCourseAsLearned?: (courseId: string) => void;
}

enum LearningState {
  IDLE = 'IDLE',
  LOADING_ASSETS = 'LOADING_ASSETS',
  READING_CONTENT = 'READING_CONTENT', // 先朗读古诗/典籍内容
  READING_PAUSED = 'READING_PAUSED', // 朗读完成，等待跟读或继续
  EXPLAINING = 'EXPLAINING',
  EXPLAINING_PAUSED = 'EXPLAINING_PAUSED', // 讲解完成，等待重听或继续
  QUESTIONING = 'QUESTIONING',
  WAITING_FOR_ANSWER = 'WAITING_FOR_ANSWER',
  PROCESSING_ANSWER = 'PROCESSING_ANSWER',
  FEEDBACK = 'FEEDBACK',
  COMPLETED = 'COMPLETED'
}

const ChildMode: React.FC<ChildModeProps> = ({
  profile,
  diaries,
  allContents,
  todayContent,
  yesterdayContent,
  familyCode,
  onUpdateProfile,
  onOpenParentGate,
  onMarkCourseAsLearned
}) => {
  const toast = useToast();
  const [view, setView] = useState<ChildView>(ChildView.HOME);
  const [selectedContent, setSelectedContent] = useState<ClassicContent | null>(null);
  const [showYesterday, setShowYesterday] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  // 加载积分
  useEffect(() => {
    const loadPoints = async () => {
      if (familyCode) {
        const score = await getTotalScore(familyCode);
        setTotalPoints(score);
      }
    };
    loadPoints();
  }, [familyCode, view]);

  // Learning State
  const [learningState, setLearningState] = useState<LearningState>(LearningState.IDLE);
  const [illustration, setIllustration] = useState<string | null>(null);
  const [explanationAudio, setExplanationAudio] = useState<AudioBuffer | null>(null);
  const [questionAudio, setQuestionAudio] = useState<AudioBuffer | null>(null);
  const [feedbackAudio, setFeedbackAudio] = useState<AudioBuffer | null>(null);
  const [currentScript, setCurrentScript] = useState<{explanation: string, question: string} | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [showFlowerAnimation, setShowFlowerAnimation] = useState(false);
  const [preloadedReadingAudio, setPreloadedReadingAudio] = useState<ArrayBuffer | null>(null);

  // Refs
  const explanationPlayerRef = useRef<AudioPlayerHandle>(null);
  const questionPlayerRef = useRef<AudioPlayerHandle>(null);
  const feedbackPlayerRef = useRef<AudioPlayerHandle>(null);

  // Touch handling for swipe
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // 重置，避免点击时误判为滑动
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 80;

    if (diff > threshold && !showYesterday) {
      // Swipe left - show yesterday
      setShowYesterday(true);
    } else if (diff < -threshold && showYesterday) {
      // Swipe right - show today
      setShowYesterday(false);
    }
  };

  const currentDisplayContent = showYesterday ? yesterdayContent : todayContent;

  const startLearning = async (content: ClassicContent) => {
    setSelectedContent(content);
    setView(ChildView.LEARNING);
    setLearningState(LearningState.LOADING_ASSETS);
    setPreloadedReadingAudio(null); // 重置预加载音频

    // 构建第一段朗读文本
    const fullText = content.phrases.map(p => p.text).join(' ');
    const readingText = `${profile.name}，我们今天学的是，${content.title}。跟我一起读。${fullText}`;

    try {
      // 并行启动所有任务：图片、脚本、第一段音频
      const imagePromise = generateIllustration(content);
      const scriptPromise = generateLessonScript(content, profile.name, profile.age, diaries);
      const readingAudioPromise = generateSpeechMiniMax(readingText);

      // 等待所有任务完成
      const [img, script, readingAudio] = await Promise.all([
        imagePromise,
        scriptPromise,
        readingAudioPromise
      ]);

      if (img) setIllustration(img);
      setCurrentScript(script);
      if (readingAudio) setPreloadedReadingAudio(readingAudio);

      // 先朗读古诗内容，再讲解
      setLearningState(LearningState.READING_CONTENT);
    } catch (e) {
      console.error("Failed to load lesson assets", e);
      toast.error('加载失败，请重试');
      setLearningState(LearningState.IDLE);
      setView(ChildView.HOME);
    }
  };

  // 朗读完古诗内容后，进入暂停状态让孩子跟读
  const handleReadingEnded = () => {
    setTimeout(() => setLearningState(LearningState.READING_PAUSED), 500);
  };

  // 重新朗读内容
  const handleReplayReading = () => {
    setLearningState(LearningState.READING_CONTENT);
  };

  // 继续到讲解
  const handleContinueToExplaining = () => {
    setLearningState(LearningState.EXPLAINING);
  };

  const handleExplanationEnded = () => {
    setTimeout(() => setLearningState(LearningState.EXPLAINING_PAUSED), 500);
  };

  // 重新讲解
  const handleReplayExplanation = () => {
    setLearningState(LearningState.EXPLAINING);
  };

  // 继续到提问
  const handleContinueToQuestioning = () => {
    setLearningState(LearningState.QUESTIONING);
  };

  const handleQuestionEnded = () => {
    setLearningState(LearningState.WAITING_FOR_ANSWER);
  };

  const handleAnswerRecorded = async (blob: Blob) => {
    setLearningState(LearningState.PROCESSING_ANSWER);
    if (!currentScript) return;

    try {
      const feedback = await analyzeAnswerAndEncourage(blob, currentScript.question, profile.name);
      setFeedbackText(feedback);

      const fbAudio = await generateSpeech(feedback);
      setFeedbackAudio(fbAudio);

      setLearningState(LearningState.FEEDBACK);
      setShowFlowerAnimation(true);

      setTimeout(() => setShowFlowerAnimation(false), 1500);
    } catch (e) {
      console.error("Error processing answer", e);
      setLearningState(LearningState.WAITING_FOR_ANSWER);
    }
  };

  const handleFeedbackEnded = () => {
    setLearningState(LearningState.COMPLETED);
    // 标记课程为已学习，会自动增加5个小元宝
    if (selectedContent && onMarkCourseAsLearned) {
      onMarkCourseAsLearned(selectedContent.id);
      // 本地更新积分显示（+5小元宝）
      setTotalPoints(prev => prev + 5);
    }
  };

  const resetLearning = () => {
    setLearningState(LearningState.IDLE);
    setIllustration(null);
    setExplanationAudio(null);
    setQuestionAudio(null);
    setFeedbackAudio(null);
    setCurrentScript(null);
    setFeedbackText('');
    setSelectedContent(null);
    setView(ChildView.HOME);
  };

  // Group contents by category
  const contentsByCategory = allContents.reduce((acc, content) => {
    if (!acc[content.category]) acc[content.category] = [];
    acc[content.category].push(content);
    return acc;
  }, {} as Record<string, ClassicContent[]>);

  // ==================== 底部导航栏组件 ====================
  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary-100 safe-area-bottom">
      <div className="flex items-center justify-around p-2 md:p-3 max-w-2xl mx-auto">
        <button
          onClick={() => setView(ChildView.HOME)}
          className={`touch-target flex flex-col items-center gap-1 px-4 py-2 rounded-2xl cursor-pointer transition-colors ${
            view === ChildView.HOME ? 'bg-primary-50 text-primary-600' : 'text-primary-300'
          }`}
        >
          <HomeIcon />
          <span className="text-xs font-medium">首页</span>
        </button>

        <button
          onClick={() => setView(ChildView.COURSE_MENU)}
          className={`touch-target flex flex-col items-center gap-1 px-4 py-2 rounded-2xl cursor-pointer transition-colors ${
            view === ChildView.COURSE_MENU ? 'bg-primary-50 text-primary-600' : 'text-primary-300'
          }`}
        >
          <BookIcon />
          <span className="text-xs font-medium">课程</span>
        </button>

        <button
          onClick={() => setView(ChildView.GIFT_SHOP)}
          className={`touch-target flex flex-col items-center gap-1 px-4 py-2 rounded-2xl cursor-pointer transition-colors ${
            view === ChildView.GIFT_SHOP ? 'bg-primary-50 text-primary-600' : 'text-primary-300'
          }`}
        >
          <GiftIcon />
          <span className="text-xs font-medium">礼物</span>
        </button>

        <button
          onClick={() => setView(ChildView.MY_RECORDS)}
          className={`touch-target flex flex-col items-center gap-1 px-4 py-2 rounded-2xl cursor-pointer transition-colors ${
            view === ChildView.MY_RECORDS ? 'bg-primary-50 text-primary-600' : 'text-primary-300'
          }`}
        >
          <ListIcon />
          <span className="text-xs font-medium">记录</span>
        </button>

        <button
          onClick={onOpenParentGate}
          className="touch-target flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-primary-300 cursor-pointer hover:text-primary-400 transition-colors"
        >
          <LockIcon />
          <span className="text-xs font-medium">家长</span>
        </button>
      </div>
    </div>
  );

  // ==================== 渲染内容区域 ====================
  const renderContent = () => {
    // 礼物商城视图
    if (view === ChildView.GIFT_SHOP) {
      return (
        <GiftShop
          familyCode={familyCode}
          totalPoints={totalPoints}
        />
      );
    }

    // 我的记录视图
    if (view === ChildView.MY_RECORDS) {
      return (
        <MyRecords
          familyCode={familyCode}
        />
      );
    }

    // 课程菜单视图
    if (view === ChildView.COURSE_MENU) {
      return (
        <div className="flex flex-col h-full bg-gradient-to-b from-primary-50 to-white">
          {/* Header */}
          <div className="safe-area-top bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-10">
            <div className="flex items-center justify-between p-4 md:p-6">
              <div className="w-12"></div>
              <h1 className="font-heading text-xl md:text-2xl text-primary-800">课程菜单</h1>
              <div className="flex items-center gap-2 clay-card px-3 py-1.5">
                <span className="text-lg">💰</span>
                <span className="font-heading text-lg text-accent-orange">{totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24">
            {Object.entries(contentsByCategory).map(([category, contents]: [string, ClassicContent[]]) => {
              const info = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
              return (
                <div key={category} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{info?.icon}</span>
                    <div>
                      <h2 className="font-heading text-lg md:text-xl text-primary-800">{info?.name || category}</h2>
                      <p className="text-sm text-primary-500">{info?.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {contents.map((content, idx) => (
                      <button
                        key={content.id}
                        onClick={() => startLearning(content)}
                        className={`clay-card p-4 md:p-5 text-left cursor-pointer transition-all duration-200 hover:shadow-clay-hover active:scale-[0.98] ${
                          content.isLearned ? 'border-l-4 border-l-accent-green' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-primary-100 text-primary-600 text-xs font-bold px-2 py-1 rounded-full">
                                {idx + 1}
                              </span>
                              {content.isLearned && (
                                <span className="text-accent-green text-sm font-bold">✓</span>
                              )}
                            </div>
                            <h3 className="font-heading text-primary-800 text-base md:text-lg mb-1 truncate">
                              {content.title}
                            </h3>
                            <p className="text-primary-500 text-sm line-clamp-2">{content.phrases.map(p => p.text).join(' ')}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 学习视图
    if (view === ChildView.LEARNING && selectedContent) {
      return (
        <div className="flex flex-col h-full bg-gradient-to-b from-primary-50 to-white">
          {/* Header */}
          <div className="safe-area-top bg-white/80 backdrop-blur-sm border-b border-primary-100">
            <div className="flex items-center justify-between p-4 md:p-6">
              <button
                onClick={resetLearning}
                className="touch-target flex items-center gap-2 text-primary-600 font-semibold cursor-pointer"
              >
                <ChevronLeftIcon />
              </button>
              <div className="flex items-center gap-2 clay-card px-3 py-1.5">
                <span className="text-lg">💰</span>
                <span className={`font-heading text-lg text-accent-orange ${showFlowerAnimation ? 'bounce-reward' : ''}`}>
                  {totalPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-24">
            <div className="max-w-2xl mx-auto">
              {/* Title */}
              <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl text-primary-800 text-center mb-6">
                {selectedContent.title}
              </h1>

              {/* Image Card */}
              <div className="max-w-md mx-auto mb-8">
                <div className="clay-card aspect-square overflow-hidden">
                  {learningState === LearningState.LOADING_ASSETS ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50">
                      <div className="w-16 h-16 border-4 border-primary-300 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                      <p className="font-heading text-primary-600 text-lg">姐姐正在准备...</p>
                    </div>
                  ) : illustration ? (
                    <img src={illustration} alt="配图" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-candy-lavender p-6">
                      <PinyinText
                        pinyin={selectedContent.phrases.map(p => p.pinyin).join(' ')}
                        text={selectedContent.phrases.map(p => p.text).join('')}
                        size="lg"
                      />
                    </div>
                  )}
                </div>
                {/* 导出按钮 - 放在图片下方 */}
                {illustration && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = illustration;
                        link.download = `${selectedContent.title}.png`;
                        link.click();
                      }}
                      className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 text-sm cursor-pointer transition-colors"
                      title="保存图片"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      保存图片
                    </button>
                  </div>
                )}
              </div>

              {/* Interaction Area */}
              <div className="space-y-6">
                {/* 朗读古诗内容 */}
                {learningState === LearningState.READING_CONTENT && selectedContent && (
                  <div className="text-center clay-card p-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse"></div>
                      <p className="font-heading text-accent-green text-lg">跟我一起读~</p>
                    </div>
                    <AudioPlayer
                      audioBuffer={null}
                      text={`${profile.name}，我们今天学的是，${selectedContent.title}。跟我一起读。${selectedContent.phrases.map(p => p.text).join(' ')}`}
                      preloadedAudio={preloadedReadingAudio}
                      autoPlay={true}
                      onEnded={handleReadingEnded}
                    />
                  </div>
                )}

                {/* 朗读暂停 - 等待跟读 */}
                {learningState === LearningState.READING_PAUSED && selectedContent && (
                  <div className="text-center clay-card p-6">
                    <div className="text-4xl mb-3">📖</div>
                    <p className="font-heading text-primary-700 text-lg mb-2">
                      跟着读一遍吧~
                    </p>
                    <p className="text-primary-500 text-sm mb-6">
                      {selectedContent.phrases.map(p => p.text).join(' ')}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleReplayReading}
                        className="clay-btn-secondary px-5 py-3 rounded-2xl font-heading text-primary-600 cursor-pointer flex items-center gap-2"
                      >
                        <RefreshIcon className="w-5 h-5" />
                        再读一遍
                      </button>
                      <button
                        onClick={handleContinueToExplaining}
                        className="clay-btn px-5 py-3 rounded-2xl font-heading text-white cursor-pointer flex items-center gap-2"
                      >
                        听懂了
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {learningState === LearningState.EXPLAINING && (
                  <div className="text-center clay-card p-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse"></div>
                      <p className="font-heading text-primary-600 text-lg">正在讲解...</p>
                    </div>
                    <AudioPlayer ref={explanationPlayerRef} audioBuffer={explanationAudio} text={currentScript?.explanation} autoPlay={true} onEnded={handleExplanationEnded} />
                  </div>
                )}

                {/* 讲解暂停 - 等待确认理解 */}
                {learningState === LearningState.EXPLAINING_PAUSED && (
                  <div className="text-center clay-card p-6">
                    <div className="text-4xl mb-3">💡</div>
                    <p className="font-heading text-primary-700 text-lg mb-6">
                      听懂了吗？
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleReplayExplanation}
                        className="clay-btn-secondary px-5 py-3 rounded-2xl font-heading text-primary-600 cursor-pointer flex items-center gap-2"
                      >
                        <RefreshIcon className="w-5 h-5" />
                        再听一遍
                      </button>
                      <button
                        onClick={handleContinueToQuestioning}
                        className="clay-btn px-5 py-3 rounded-2xl font-heading text-white cursor-pointer flex items-center gap-2"
                      >
                        听懂了
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {learningState === LearningState.QUESTIONING && (
                  <div className="text-center clay-card p-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-accent-orange rounded-full animate-pulse"></div>
                      <p className="font-heading text-accent-orange text-lg">提问时间~</p>
                    </div>
                    <AudioPlayer ref={questionPlayerRef} audioBuffer={questionAudio} text={currentScript?.question} autoPlay={true} onEnded={handleQuestionEnded} />
                  </div>
                )}

                {(learningState === LearningState.WAITING_FOR_ANSWER || learningState === LearningState.PROCESSING_ANSWER) && (
                  <div className="clay-card p-6">
                    <p className="font-heading text-primary-700 text-center mb-4 text-lg">
                      {currentScript?.question}
                    </p>
                    <Recorder onRecordingComplete={handleAnswerRecorded} isProcessing={learningState === LearningState.PROCESSING_ANSWER} />
                  </div>
                )}

                {learningState === LearningState.FEEDBACK && (
                  <div className="text-center clay-card p-6 bg-gradient-to-br from-candy-lemon to-candy-peach">
                    <div className="text-6xl mb-4 float">🎉</div>
                    <p className="font-heading text-primary-800 text-lg mb-4">{feedbackText}</p>
                    <AudioPlayer ref={feedbackPlayerRef} audioBuffer={feedbackAudio} text={feedbackText} autoPlay={true} onEnded={handleFeedbackEnded} />
                  </div>
                )}

                {learningState === LearningState.COMPLETED && (
                  <div className="text-center">
                    <div className="clay-card p-8 bg-gradient-to-br from-accent-green/10 to-primary-50 mb-6">
                      <div className="text-5xl mb-4">🌟</div>
                      <h2 className="font-heading text-2xl text-primary-800 mb-2">太棒了！</h2>
                      <p className="text-primary-600">今天的学习完成啦~</p>
                      <p className="text-primary-500 text-sm mt-2">明天再来哦！</p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => {
                          setLearningState(LearningState.IDLE);
                          startLearning(selectedContent);
                        }}
                        className="clay-btn-secondary px-6 py-3 rounded-2xl font-heading text-primary-600 cursor-pointer"
                      >
                        再学一遍
                      </button>
                      <button
                        onClick={resetLearning}
                        className="clay-btn px-6 py-3 rounded-2xl font-heading text-white cursor-pointer"
                      >
                        回到首页
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 首页视图
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-primary-50 to-white">
        {/* Header */}
        <div className="safe-area-top bg-white/80 backdrop-blur-sm border-b border-primary-100">
          <div className="flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-soft">
                <span className="text-white font-heading text-xl md:text-2xl">叮</span>
              </div>
              <div>
                <p className="text-primary-500 text-sm">欢迎回来</p>
                <p className="font-heading text-primary-800 text-lg md:text-xl">{profile.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 clay-card px-4 py-2">
              <span className="text-2xl">💰</span>
              <span className="font-heading text-xl text-accent-orange">{totalPoints}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="max-w-2xl mx-auto">
            {/* Swipe Indicator */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setShowYesterday(true)}
                className={`text-sm font-medium transition-colors cursor-pointer ${showYesterday ? 'text-primary-600' : 'text-primary-300'}`}
              >
                昨天
              </button>
              <div className="flex gap-2">
                <div className={`w-2 h-2 rounded-full transition-all ${!showYesterday ? 'bg-primary-500 w-6' : 'bg-primary-200'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-all ${showYesterday ? 'bg-primary-500 w-6' : 'bg-primary-200'}`}></div>
              </div>
              <button
                onClick={() => setShowYesterday(false)}
                className={`text-sm font-medium transition-colors cursor-pointer ${!showYesterday ? 'text-primary-600' : 'text-primary-300'}`}
              >
                今天
              </button>
            </div>

            {/* Swipe Hint */}
            {!showYesterday && (
              <p className="text-center text-primary-400 text-sm mb-4 swipe-hint">
                ← 左滑查看昨天的内容
              </p>
            )}

            {/* Main Card */}
            <div className="clay-card overflow-hidden mb-6 cursor-pointer transition-all duration-200 hover:shadow-clay-hover active:scale-[0.98]"
                 onClick={() => startLearning(currentDisplayContent)}>
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-400 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${showYesterday ? 'bg-white/20 text-white' : 'bg-white text-primary-600'}`}>
                    {showYesterday ? '复习' : '今日学习'}
                  </span>
                  {CATEGORY_INFO[currentDisplayContent.category as keyof typeof CATEGORY_INFO] && (
                    <span className="text-white/80 text-sm">
                      {CATEGORY_INFO[currentDisplayContent.category as keyof typeof CATEGORY_INFO].name}
                    </span>
                  )}
                </div>
                <h2 className="font-heading text-xl md:text-2xl lg:text-3xl text-white">
                  {currentDisplayContent.title}
                </h2>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8">
                <div className="bg-gradient-to-br from-primary-50 to-candy-lavender rounded-2xl flex items-center justify-center p-6 md:p-8 mb-6">
                  <PinyinText
                    pinyin={currentDisplayContent.phrases.map(p => p.pinyin).join(' ')}
                    text={currentDisplayContent.phrases.map(p => p.text).join('')}
                    size="md"
                  />
                </div>

                <button className="w-full clay-btn py-4 md:py-5 rounded-2xl font-heading text-lg md:text-xl text-white flex items-center justify-center gap-2 cursor-pointer">
                  <span>点击开始学习</span>
                  <span className="text-2xl">→</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="clay-card p-4 md:p-5 text-center">
                <p className="text-primary-400 text-sm mb-1">已学习</p>
                <p className="font-heading text-2xl md:text-3xl text-primary-700">
                  {allContents.filter(c => c.isLearned).length}
                </p>
                <p className="text-primary-400 text-xs">篇经典</p>
              </div>
              <div className="clay-card p-4 md:p-5 text-center">
                <p className="text-primary-400 text-sm mb-1">小元宝</p>
                <p className="font-heading text-2xl md:text-3xl text-accent-orange">
                  {totalPoints}
                </p>
                <p className="text-primary-400 text-xs">可兑换礼物</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== 主渲染 ====================
  return (
    <div className="relative h-full">
      {renderContent()}
      <BottomNavigation />
    </div>
  );
};

export default ChildMode;
