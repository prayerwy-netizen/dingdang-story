export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  photos: string[]; // Base64 strings or URLs
  isDraft?: boolean; // 草稿标记
}

export interface ChildProfile {
  name: string;
  age: number;
  redFlowers: number;
}

export interface ClassicContent {
  id: string;
  title: string; // e.g., "弟子规 - 总叙"
  text: string; // e.g., "弟子规 圣人训 首孝弟 次谨信"
  pinyin: string; // e.g., "dì zǐ guī  shèng rén xùn  shǒu xiào tì  cì jǐn xìn"
  category: 'dizigui' | 'tangshi' | 'custom'; // 新增custom类型
  isLearned?: boolean; // 是否已学习
  learnedDate?: string; // 学习日期
}

export interface DailyLesson {
  date: string; // YYYY-MM-DD
  contentId: string;
  illustrationUrl?: string; // Generated image
  explanationAudio?: ArrayBuffer; // Generated TTS
  explanationText?: string;
  questionText?: string;
  questionAudio?: ArrayBuffer;
  isCompleted: boolean;
}

export enum AppMode {
  CHILD = 'CHILD',
  PARENT = 'PARENT'
}

export enum ChildView {
  HOME = 'HOME',
  LEARNING = 'LEARNING',
  COURSE_MENU = 'COURSE_MENU',
  GIFT_SHOP = 'GIFT_SHOP',
  MY_RECORDS = 'MY_RECORDS'
}

export enum ParentTab {
  DIARY = 'DIARY',
  QUICK_RECORD = 'QUICK_RECORD',
  TASK_MANAGER = 'TASK_MANAGER',
  GIFT_MANAGER = 'GIFT_MANAGER',
  APPROVAL = 'APPROVAL',
  SETTINGS = 'SETTINGS',
  CUSTOM_CONTENT = 'CUSTOM_CONTENT'
}

// 学习进度记录
export interface LearningProgress {
  contentId: string;
  completedAt: string;
  earnedFlowers: number;
}

// AI 提供商
export type AIProvider = 'gemini' | 'volcengine';

// ============================================
// 打卡系统类型定义
// ============================================

// 任务
export interface Task {
  id: string;
  family_code: string;
  name: string;
  unit: string;
  score: number;
  type: 'positive' | 'negative';
  enabled: boolean;
  created_at: string;
  updated_at?: string;
}

// 礼物
export interface Gift {
  id: string;
  family_code: string;
  name: string;
  image: string;
  score: number;
  enabled: boolean;
  created_at: string;
  updated_at?: string;
}

// 积分记录
export interface PointRecord {
  id: string;
  family_code: string;
  task_id?: string;
  task_name: string;
  score: number;
  note?: string;
  date: string;
}

// 兑换申请
export interface GiftRequest {
  id: string;
  family_code: string;
  gift_id: string;
  gift_name: string;
  score: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}
