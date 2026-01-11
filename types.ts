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
  COURSE_MENU = 'COURSE_MENU'
}

export enum ParentTab {
  DIARY = 'DIARY',
  SETTINGS = 'SETTINGS',
  CUSTOM_CONTENT = 'CUSTOM_CONTENT'
}

// 学习进度记录
export interface LearningProgress {
  contentId: string;
  completedAt: string;
  earnedFlowers: number;
}
