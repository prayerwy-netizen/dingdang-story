import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AppMode, ChildProfile, DiaryEntry, ClassicContent } from './types';
import { CLASSIC_LIBRARY, getTodayContentIndex } from './constants';
import ChildMode from './components/ChildMode';
import ParentMode from './components/ParentMode';
import ParentGate from './components/ParentGate';
import FamilyCodeEntry from './components/FamilyCodeEntry';
import ToastContainer from './components/ToastContainer';
import { ToastProvider } from './contexts/ToastContext';

// 服务层导入
import * as familyService from './services/familyService';
import { addRecord } from './services/recordService';

const FAMILY_CODE_KEY = 'dingdang_family_code';

const App: React.FC = () => {
  // 家庭码
  const [familyCode, setFamilyCode] = useState<string | null>(() => {
    return localStorage.getItem(FAMILY_CODE_KEY);
  });

  const [mode, setMode] = useState<AppMode>(AppMode.CHILD);
  const [showParentGate, setShowParentGate] = useState(false);
  const [profile, setProfile] = useState<familyService.Profile | null>(null);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [customContents, setCustomContents] = useState<ClassicContent[]>([]);
  const [learnedCourseIds, setLearnedCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 从 profile 构建前端使用的 ChildProfile
  const childProfile: ChildProfile = useMemo(() => ({
    name: profile?.name || '宝贝',
    age: profile?.age || 5,
    redFlowers: profile?.red_flowers || 0,
  }), [profile]);

  // 课程偏移量
  const courseStartOffset = profile?.course_offset || 0;

  // 加载用户数据（单次 API 调用批量加载）
  const loadUserData = useCallback(async (code: string) => {
    setLoading(true);

    try {
      // 使用批量加载接口，只需一次 API 调用
      const data = await familyService.loadAllUserData(code);
      if (data) {
        setProfile(data.profile);
        setDiaries(data.diaries.map(familyService.toFrontendDiary));
        setCustomContents(data.customContents.map(familyService.toFrontendContent));
        setLearnedCourseIds(new Set(data.learningRecords.map(r => r.course_id)));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 家庭码变化时加载数据
  useEffect(() => {
    if (familyCode) {
      loadUserData(familyCode);
    } else {
      setLoading(false);
    }
  }, [familyCode, loadUserData]);

  // 设置家庭码
  const handleFamilyCodeSubmit = (code: string) => {
    localStorage.setItem(FAMILY_CODE_KEY, code);
    setFamilyCode(code);
  };

  // 合并内置经典和自定义内容，标记已学习状态
  const allContents = useMemo(() => {
    const contents = [...CLASSIC_LIBRARY, ...customContents];
    return contents.map(c => ({
      ...c,
      isLearned: learnedCourseIds.has(c.id),
    }));
  }, [customContents, learnedCourseIds]);

  // 计算今日和昨日内容
  const baseIndex = getTodayContentIndex(allContents);
  const todayIndex = (baseIndex - courseStartOffset + allContents.length) % allContents.length;
  const yesterdayIndex = todayIndex === 0 ? allContents.length - 1 : todayIndex - 1;
  const todayContent = allContents[todayIndex];
  const yesterdayContent = allContents[yesterdayIndex];

  // 更新用户资料
  const handleUpdateProfile = async (updates: Partial<ChildProfile>) => {
    if (!familyCode) return;

    const dbUpdates: Parameters<typeof familyService.updateProfile>[1] = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.redFlowers !== undefined) dbUpdates.red_flowers = updates.redFlowers;

    const result = await familyService.updateProfile(familyCode, dbUpdates);
    if (result.success) {
      setProfile(prev => prev ? { ...prev, ...dbUpdates } : null);
    }
  };

  // 添加/更新日记
  const handleAddDiary = async (entry: DiaryEntry) => {
    if (!familyCode) return;

    const existingDiary = diaries.find(d => d.id === entry.id);

    if (existingDiary) {
      const result = await familyService.updateDiary(entry.id, {
        content: entry.content,
        photos: entry.photos,
        is_draft: entry.isDraft || false,
      }, familyCode);
      if (result.success) {
        setDiaries(prev => prev.map(d => d.id === entry.id ? entry : d));
      }
    } else {
      const result = await familyService.createDiary(familyCode, {
        date: entry.date,
        content: entry.content,
        photos: entry.photos,
        is_draft: entry.isDraft || false,
      });
      if (result.success && result.data) {
        const newEntry = familyService.toFrontendDiary(result.data);
        setDiaries(prev => [newEntry, ...prev]);
      }
    }
  };

  // 删除日记
  const handleDeleteDiary = async (id: string) => {
    const result = await familyService.deleteDiary(id);
    if (result.success) {
      setDiaries(prev => prev.filter(d => d.id !== id));
    }
  };

  // 添加自定义内容
  const handleAddCustomContent = async (content: ClassicContent) => {
    if (!familyCode) return;

    // 将 phrases 转换为 text + pinyin 存储
    const text = content.phrases.map(p => p.text).join(' ');
    const pinyin = content.phrases.map(p => p.pinyin).join(' ');

    const result = await familyService.createCustomContent(familyCode, {
      title: content.title,
      text,
      pinyin,
    });

    if (result.success && result.data) {
      const newContent = familyService.toFrontendContent(result.data);
      setCustomContents(prev => [...prev, newContent]);
    }
  };

  // 删除自定义内容
  const handleDeleteCustomContent = async (id: string) => {
    const result = await familyService.deleteCustomContent(id);
    if (result.success) {
      setCustomContents(prev => prev.filter(c => c.id !== id));
    }
  };

  // 打开家长验证页面
  const handleOpenParentGate = () => {
    setShowParentGate(true);
  };

  // 家长验证成功
  const handleParentGateSuccess = () => {
    setShowParentGate(false);
    setMode(AppMode.PARENT);
  };

  // 取消家长验证
  const handleParentGateCancel = () => {
    setShowParentGate(false);
  };

  // 重置课程
  const handleResetCourse = async () => {
    if (!familyCode) return;

    // 计算当前基准索引，重置后 todayIndex = baseIndex - baseIndex = 0（第一课）
    const newOffset = baseIndex;
    const result = await familyService.resetCourseProgress(familyCode, newOffset);
    if (result.success) {
      setProfile(prev => prev ? { ...prev, course_offset: newOffset } : null);
      setLearnedCourseIds(new Set());
    }
  };

  // 标记课程为已学习
  const handleMarkCourseAsLearned = async (courseId: string) => {
    if (!familyCode) return;
    if (learnedCourseIds.has(courseId)) return;

    const result = await familyService.markCourseAsLearned(familyCode, courseId);
    if (result.success) {
      setLearnedCourseIds(prev => new Set([...prev, courseId]));

      // 添加5个小元宝奖励
      const content = allContents.find(c => c.id === courseId);
      await addRecord(familyCode, {
        task_name: `学习完成：${content?.title || '国学经典'}`,
        score: 5,
        note: '学习奖励',
      });
    }
  };

  // 切换家庭码
  const handleSwitchFamily = () => {
    if (confirm('确定要切换家庭码吗？')) {
      localStorage.removeItem(FAMILY_CODE_KEY);
      setFamilyCode(null);
      setProfile(null);
      setDiaries([]);
      setCustomContents([]);
      setLearnedCourseIds(new Set());
    }
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔔</div>
          <p className="text-sky-600 text-lg">宝贝学堂加载中...</p>
        </div>
      </div>
    );
  }

  // 未设置家庭码，显示输入页面
  if (!familyCode) {
    return <FamilyCodeEntry onCodeSubmit={handleFamilyCodeSubmit} />;
  }

  // 显示家长验证页面
  if (showParentGate) {
    return (
      <ParentGate
        onSuccess={handleParentGateSuccess}
        onCancel={handleParentGateCancel}
      />
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
        <div className="min-h-screen w-full md:max-w-2xl lg:max-w-4xl md:mx-auto md:py-4 lg:py-6">
          <div className="min-h-screen md:min-h-0 md:h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] bg-white md:rounded-4xl md:shadow-clay overflow-hidden">
            {mode === AppMode.CHILD ? (
              <ChildMode
                profile={childProfile}
                diaries={diaries}
                allContents={allContents}
                todayContent={todayContent}
                yesterdayContent={yesterdayContent}
                familyCode={familyCode}
                onUpdateProfile={handleUpdateProfile}
                onOpenParentGate={handleOpenParentGate}
                onMarkCourseAsLearned={handleMarkCourseAsLearned}
              />
            ) : (
              <ParentMode
                profile={childProfile}
                diaries={diaries}
                customContents={customContents}
                currentLessonIndex={todayIndex}
                totalLessons={allContents.length}
                familyCode={familyCode}
                onAddDiary={handleAddDiary}
                onDeleteDiary={handleDeleteDiary}
                onUpdateProfile={handleUpdateProfile}
                onAddCustomContent={handleAddCustomContent}
                onDeleteCustomContent={handleDeleteCustomContent}
                onResetCourse={handleResetCourse}
                onSwitchFamily={handleSwitchFamily}
                onExit={() => setMode(AppMode.CHILD)}
              />
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;
