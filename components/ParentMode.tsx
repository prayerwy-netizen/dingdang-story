import React, { useState, useRef, useEffect } from 'react';
import { DiaryEntry, ChildProfile, ClassicContent, ParentTab, AIProvider } from '../types';
import { getAIProvider, setAIProvider, getAvailableProviders } from '../services/aiService';
import { getPendingCount } from '../services/requestService';
import QuickRecord from './QuickRecord';
import TaskManager from './TaskManager';
import GiftManager from './GiftManager';
import ApprovalCenter from './ApprovalCenter';

interface ParentModeProps {
  profile: ChildProfile;
  diaries: DiaryEntry[];
  customContents: ClassicContent[];
  currentLessonIndex: number;
  totalLessons: number;
  familyCode: string;
  onAddDiary: (entry: DiaryEntry) => void;
  onDeleteDiary: (id: string) => void;
  onUpdateProfile: (updates: Partial<ChildProfile>) => void;
  onAddCustomContent: (content: ClassicContent) => void;
  onDeleteCustomContent: (id: string) => void;
  onResetCourse: () => void;
  onSwitchFamily?: () => void;
  onExit: () => void;
}

// SVG Icons
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ParentMode: React.FC<ParentModeProps> = ({
  profile,
  diaries,
  customContents,
  currentLessonIndex,
  totalLessons,
  familyCode,
  onAddDiary,
  onDeleteDiary,
  onUpdateProfile,
  onAddCustomContent,
  onDeleteCustomContent,
  onResetCourse,
  onSwitchFamily,
  onExit
}) => {
  const [activeTab, setActiveTab] = useState<ParentTab>(ParentTab.DIARY);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  // 加载待审批数量
  useEffect(() => {
    const loadPendingCount = async () => {
      if (familyCode) {
        const count = await getPendingCount(familyCode);
        setPendingApprovalCount(count);
      }
    };
    loadPendingCount();
    // 每次切换 Tab 也刷新
  }, [familyCode, activeTab]);

  // Diary State
  const [diaryId, setDiaryId] = useState<string | null>(null);
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [diaryText, setDiaryText] = useState('');
  const [diaryPhotos, setDiaryPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [editName, setEditName] = useState(profile.name);
  const [editAge, setEditAge] = useState(profile.age);
  const [aiProvider, setAiProvider] = useState<AIProvider>(getAIProvider());
  const availableProviders = getAvailableProviders();

  // Custom Content State
  const [showAddContent, setShowAddContent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newPinyin, setNewPinyin] = useState('');

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - diaryPhotos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDiaryPhotos(prev => {
          if (prev.length >= 10) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setDiaryPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Save diary
  const handleSaveDiary = (isDraft: boolean = false) => {
    if (!diaryText.trim() && !isDraft) {
      alert('请输入日记内容');
      return;
    }

    const entry: DiaryEntry = {
      id: diaryId || Date.now().toString(),
      date: diaryDate,
      content: diaryText,
      photos: diaryPhotos,
      isDraft
    };

    onAddDiary(entry);

    if (!isDraft) {
      // Clear form after saving
      setDiaryId(null);
      setDiaryText('');
      setDiaryPhotos([]);
      setDiaryDate(new Date().toISOString().split('T')[0]);
      alert('日记已保存！');
    } else {
      setDiaryId(entry.id);
      alert('草稿已保存！');
    }
  };

  // Load draft for editing
  const loadDiary = (entry: DiaryEntry) => {
    setDiaryId(entry.id);
    setDiaryDate(entry.date);
    setDiaryText(entry.content);
    setDiaryPhotos(entry.photos);
  };

  // Save settings
  const handleSaveSettings = () => {
    onUpdateProfile({ name: editName, age: editAge });
    alert('设置已更新！');
  };

  // Add custom content
  const handleAddCustomContent = () => {
    if (!newTitle.trim() || !newText.trim()) {
      alert('请填写标题和内容');
      return;
    }

    const content: ClassicContent = {
      id: `custom-${Date.now()}`,
      category: 'custom',
      title: newTitle,
      text: newText,
      pinyin: newPinyin || ''
    };

    onAddCustomContent(content);
    setNewTitle('');
    setNewText('');
    setNewPinyin('');
    setShowAddContent(false);
    alert('内容已添加！');
  };

  // Tab button style
  const tabClass = (tab: ParentTab) => `
    flex-1 py-3 md:py-4 rounded-2xl font-heading text-base md:text-lg transition-all cursor-pointer
    ${activeTab === tab
      ? 'bg-primary-500 text-white shadow-soft'
      : 'bg-white text-primary-400 hover:bg-primary-50'
    }
  `;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <div className="safe-area-top bg-white/80 backdrop-blur-sm border-b border-primary-100">
        <div className="flex items-center justify-between p-4 md:p-6">
          <button
            onClick={onExit}
            className="touch-target flex items-center gap-2 text-primary-600 font-semibold cursor-pointer"
          >
            <ChevronLeftIcon />
            <span>返回</span>
          </button>
          <h1 className="font-heading text-xl md:text-2xl text-primary-800">家长中心</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Tabs - 两排显示 */}
      <div className="p-4 md:px-6 space-y-2">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab(ParentTab.DIARY)} className={tabClass(ParentTab.DIARY)}>
            📝 日记
          </button>
          <button onClick={() => setActiveTab(ParentTab.QUICK_RECORD)} className={tabClass(ParentTab.QUICK_RECORD)}>
            ⚡ 记账
          </button>
          <button onClick={() => setActiveTab(ParentTab.APPROVAL)} className={`${tabClass(ParentTab.APPROVAL)} relative`}>
            ✅ 审批
            {pendingApprovalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingApprovalCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab(ParentTab.TASK_MANAGER)} className={tabClass(ParentTab.TASK_MANAGER)}>
            📋 任务
          </button>
          <button onClick={() => setActiveTab(ParentTab.GIFT_MANAGER)} className={tabClass(ParentTab.GIFT_MANAGER)}>
            🎁 礼物
          </button>
          <button onClick={() => setActiveTab(ParentTab.CUSTOM_CONTENT)} className={tabClass(ParentTab.CUSTOM_CONTENT)}>
            ✨ 内容
          </button>
          <button onClick={() => setActiveTab(ParentTab.SETTINGS)} className={tabClass(ParentTab.SETTINGS)}>
            ⚙️ 设置
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* ===== 日记 Tab ===== */}
          {activeTab === ParentTab.DIARY && (
            <div className="space-y-6">
              {/* 写日记卡片 */}
              <div className="clay-card p-5 md:p-6">
                <h2 className="font-heading text-lg text-primary-800 mb-4">
                  {diaryId ? '编辑日记' : '写日记'}
                </h2>

                {/* 日期选择 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-600 mb-2">日期</label>
                  <input
                    type="date"
                    value={diaryDate}
                    onChange={(e) => setDiaryDate(e.target.value)}
                    className="w-full border-2 border-primary-200 rounded-xl p-3 bg-primary-50 focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* 内容输入 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-600 mb-2">今天发生了什么？</label>
                  <p className="text-xs text-primary-400 mb-2">记录越详细，AI讲的故事越生动哦 (200-300字最佳)</p>
                  <textarea
                    value={diaryText}
                    onChange={(e) => setDiaryText(e.target.value)}
                    placeholder="例如：今天带叮当去公园，他第一次主动把玩具分享给别的小朋友..."
                    className="w-full h-40 md:h-48 border-2 border-primary-200 rounded-xl p-4 bg-primary-50 resize-none focus:border-primary-400 focus:outline-none transition-colors"
                  />
                  <p className="text-right text-xs text-primary-400 mt-1">{diaryText.length} 字</p>
                </div>

                {/* 照片上传 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-primary-600 mb-2">
                    添加照片 ({diaryPhotos.length}/10)
                  </label>

                  <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                    {/* 已上传的照片 */}
                    {diaryPhotos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img
                          src={photo}
                          alt={`照片 ${idx + 1}`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={() => removePhoto(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* 添加照片按钮 */}
                    {diaryPhotos.length < 10 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-primary-300 rounded-xl flex flex-col items-center justify-center text-primary-400 hover:border-primary-400 hover:text-primary-500 cursor-pointer transition-colors"
                      >
                        <CameraIcon />
                        <span className="text-xs mt-1">添加</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSaveDiary(true)}
                    className="flex-1 clay-btn-secondary py-3 rounded-xl font-heading text-primary-600 cursor-pointer"
                  >
                    保存草稿
                  </button>
                  <button
                    onClick={() => handleSaveDiary(false)}
                    className="flex-1 clay-btn py-3 rounded-xl font-heading text-white cursor-pointer"
                  >
                    保存日记
                  </button>
                </div>
              </div>

              {/* 历史记录 */}
              <div>
                <h3 className="font-heading text-lg text-primary-800 mb-4">历史记录</h3>
                {diaries.length === 0 ? (
                  <div className="clay-card p-8 text-center">
                    <p className="text-primary-400">还没有日记哦</p>
                    <p className="text-primary-300 text-sm mt-1">快来记录宝贝的成长点滴吧~</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diaries.map(diary => (
                      <div
                        key={diary.id}
                        className={`clay-card p-4 md:p-5 ${diary.isDraft ? 'border-l-4 border-l-amber-400' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary-600">{diary.date}</span>
                            {diary.isDraft && (
                              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">草稿</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadDiary(diary)}
                              className="text-primary-400 hover:text-primary-600 cursor-pointer text-sm"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('确定要删除这条日记吗？')) {
                                  onDeleteDiary(diary.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-600 cursor-pointer"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                        <p className="text-primary-700 text-sm line-clamp-3">{diary.content}</p>
                        {diary.photos.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                            {diary.photos.slice(0, 4).map((photo, idx) => (
                              <img
                                key={idx}
                                src={photo}
                                alt=""
                                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                              />
                            ))}
                            {diary.photos.length > 4 && (
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-primary-500 text-sm">+{diary.photos.length - 4}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== 自定义内容 Tab ===== */}
          {activeTab === ParentTab.CUSTOM_CONTENT && (
            <div className="space-y-6">
              {/* 添加按钮 */}
              {!showAddContent && (
                <button
                  onClick={() => setShowAddContent(true)}
                  className="w-full clay-btn-secondary py-4 rounded-2xl font-heading text-primary-600 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusIcon />
                  <span>添加自定义内容</span>
                </button>
              )}

              {/* 添加表单 */}
              {showAddContent && (
                <div className="clay-card p-5 md:p-6">
                  <h2 className="font-heading text-lg text-primary-800 mb-4">添加经典内容</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-600 mb-2">标题</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="例如：自定义 · 家训"
                        className="w-full border-2 border-primary-200 rounded-xl p-3 bg-primary-50 focus:border-primary-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-600 mb-2">内容</label>
                      <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="例如：勤俭持家，礼义传家"
                        className="w-full h-24 border-2 border-primary-200 rounded-xl p-3 bg-primary-50 resize-none focus:border-primary-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-600 mb-2">拼音（可选）</label>
                      <input
                        type="text"
                        value={newPinyin}
                        onChange={(e) => setNewPinyin(e.target.value)}
                        placeholder="例如：qín jiǎn chí jiā, lǐ yì chuán jiā"
                        className="w-full border-2 border-primary-200 rounded-xl p-3 bg-primary-50 focus:border-primary-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowAddContent(false);
                          setNewTitle('');
                          setNewText('');
                          setNewPinyin('');
                        }}
                        className="flex-1 clay-btn-secondary py-3 rounded-xl font-heading text-primary-600 cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleAddCustomContent}
                        className="flex-1 clay-btn py-3 rounded-xl font-heading text-white cursor-pointer"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 自定义内容列表 */}
              <div>
                <h3 className="font-heading text-lg text-primary-800 mb-4">
                  已添加的内容 ({customContents.length})
                </h3>
                {customContents.length === 0 ? (
                  <div className="clay-card p-8 text-center">
                    <p className="text-primary-400">还没有自定义内容</p>
                    <p className="text-primary-300 text-sm mt-1">可以添加家训、诗词等内容</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customContents.map(content => (
                      <div key={content.id} className="clay-card p-4 md:p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading text-primary-800 mb-1">{content.title}</h4>
                            <p className="text-primary-500 text-sm">{content.phrases.map(p => p.text).join(' ')}</p>
                            <p className="text-primary-400 text-xs mt-1">{content.phrases.map(p => p.pinyin).join(' ')}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm('确定要删除这条内容吗？')) {
                                onDeleteCustomContent(content.id);
                              }
                            }}
                            className="ml-3 text-red-400 hover:text-red-600 cursor-pointer"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== 快速记账 Tab ===== */}
          {activeTab === ParentTab.QUICK_RECORD && (
            <QuickRecord familyCode={familyCode} />
          )}

          {/* ===== 任务管理 Tab ===== */}
          {activeTab === ParentTab.TASK_MANAGER && (
            <TaskManager familyCode={familyCode} />
          )}

          {/* ===== 礼物管理 Tab ===== */}
          {activeTab === ParentTab.GIFT_MANAGER && (
            <GiftManager familyCode={familyCode} />
          )}

          {/* ===== 审批中心 Tab ===== */}
          {activeTab === ParentTab.APPROVAL && (
            <ApprovalCenter familyCode={familyCode} />
          )}

          {/* ===== 设置 Tab ===== */}
          {activeTab === ParentTab.SETTINGS && (
            <div className="clay-card p-5 md:p-6">
              <h2 className="font-heading text-lg text-primary-800 mb-6">孩子信息</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-600 mb-2">孩子昵称</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border-2 border-primary-200 rounded-xl p-3 bg-primary-50 focus:border-primary-400 focus:outline-none text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-600 mb-2">孩子年龄</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={editAge}
                      onChange={(e) => setEditAge(Number(e.target.value))}
                      className="flex-1 h-2 bg-primary-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow-soft [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="clay-card px-4 py-2 min-w-[80px] text-center">
                      <span className="font-heading text-2xl text-primary-700">{editAge}</span>
                      <span className="text-primary-500 text-sm ml-1">岁</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveSettings}
                    className="w-full clay-btn py-4 rounded-xl font-heading text-white cursor-pointer"
                  >
                    保存设置
                  </button>
                </div>

                {/* 统计信息 */}
                <div className="pt-6 border-t border-primary-100">
                  <h3 className="font-heading text-primary-700 mb-4">学习统计</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 rounded-xl p-4 text-center">
                      <p className="text-primary-400 text-sm">累计日记</p>
                      <p className="font-heading text-2xl text-primary-700">{diaries.filter(d => !d.isDraft).length}</p>
                    </div>
                    <div className="bg-accent-orange/10 rounded-xl p-4 text-center">
                      <p className="text-primary-400 text-sm">小红花</p>
                      <p className="font-heading text-2xl text-accent-orange">{profile.redFlowers}</p>
                    </div>
                  </div>
                </div>

                {/* 课程管理 */}
                <div className="pt-6 border-t border-primary-100">
                  <h3 className="font-heading text-primary-700 mb-4">课程管理</h3>
                  <div className="bg-primary-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-primary-600">当前进度</span>
                      <span className="font-heading text-primary-800">
                        第 {currentLessonIndex + 1} / {totalLessons} 课
                      </span>
                    </div>
                    <div className="w-full bg-primary-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${((currentLessonIndex + 1) / totalLessons) * 100}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('确定要重置课程吗？重置后将从第一课开始学习。')) {
                        onResetCourse();
                        alert('课程已重置，今天从第一课开始！');
                      }
                    }}
                    className="w-full py-3 rounded-xl font-heading text-amber-600 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    重置课程（从第一课开始）
                  </button>
                </div>

                {/* AI 设置 */}
                <div className="pt-6 border-t border-primary-100">
                  <h3 className="font-heading text-primary-700 mb-4">AI 引擎</h3>
                  <p className="text-primary-400 text-sm mb-4">选择用于生成配图和讲解的 AI 服务</p>
                  <div className="space-y-3">
                    {availableProviders.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => {
                          if (provider.available) {
                            setAiProvider(provider.id);
                            setAIProvider(provider.id);
                          }
                        }}
                        disabled={!provider.available}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          aiProvider === provider.id
                            ? 'border-primary-500 bg-primary-50'
                            : provider.available
                              ? 'border-primary-200 hover:border-primary-300 bg-white'
                              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              aiProvider === provider.id ? 'border-primary-500' : 'border-primary-300'
                            }`}>
                              {aiProvider === provider.id && (
                                <div className="w-3 h-3 rounded-full bg-primary-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-heading text-primary-800">{provider.name}</p>
                              {!provider.available && (
                                <p className="text-xs text-red-400">未配置 API Key</p>
                              )}
                            </div>
                          </div>
                          {provider.id === 'gemini' && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">国际</span>
                          )}
                          {provider.id === 'volcengine' && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">国内</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-primary-300 text-xs mt-3">
                    提示：国内用户推荐使用火山引擎，速度更快
                  </p>
                </div>

                {/* 家庭码管理 */}
                {onSwitchFamily && (
                  <div className="pt-6 border-t border-primary-100">
                    <h3 className="font-heading text-primary-700 mb-4">家庭码</h3>
                    <button
                      onClick={onSwitchFamily}
                      className="w-full py-3 rounded-xl font-heading text-gray-600 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 cursor-pointer transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      切换家庭码
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentMode;
