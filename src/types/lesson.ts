// 漫画コマの型
export type MangaPanel = {
  panel_id: number;
  image: string;
  caption?: string;
};

// シャドーイング項目の型
export type ShadowingItem = {
  id: string;
  chinese: string;
  pinyin: string;
  japanese: string;
  audio: string;
};

// 会話セリフの型
export type ConversationLine = {
  id: string;
  speaker: string;
  is_learner: boolean;
  chinese: string;
  pinyin: string;
  japanese: string;
  audio: string;
  panel_id?: number;
};

// 1課全体の型
export type Lesson = {
  id: number;
  title: string;
  theme: string;
  grammar: string[];
  hsk_level: number;
  scene_description: string;
  manga_panels: MangaPanel[];
  shadowing_base: ShadowingItem[];
  conversation: ConversationLine[];
  ken_monologue: string;
  study_notes: string[];
};
