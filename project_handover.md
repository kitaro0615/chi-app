# 異世界転生中文学習アプリ（chi-app）引き継ぎ情報
## Cursor / Claude Code 向け

---

## プロジェクト概要

- **アプリ名**: 異世界転生中文学習アプリ
- **プロジェクトID**: chi-app
- **開発環境**: VS Code + Cursor（Claude Code）
- **フレームワーク**: Next.js 16.2.7
- **プロジェクトパス**: `C:\myspace-next\chi-app`

---

## 完了済み作業

### ✅ Step A：全40課 JSONデータ生成（完了）

- `src/data/lesson01.json` 〜 `src/data/lesson40.json` を配置済み
- 各JSONの構造は以下の通り

```typescript
// src/types/lesson.ts に定義済みの型と対応
{
  id: number,                  // 課番号
  title: string,               // タイトル（中国語）
  theme: string,               // テーマ
  grammar: string[],           // 習得目標文法
  hsk_level: number,           // HSKレベル（1〜4）
  scene_description: string,   // 場面描写テキスト

  manga_panels: [              // マンガコマ（4件固定）
    {
      panel_id: number,
      image: string,           // 画像パス /images/lesson01/panel_01.jpg
      caption: string
    }
  ],

  shadowing_base: [            // シャドーイング用フレーズ（7〜9件）
    {
      id: string,              // "s1" 〜
      chinese: string,
      pinyin: string,
      japanese: string,
      audio: string            // 音声パス /audio/lesson01/shadow_01.mp3
    }
  ],

  conversation: [              // 会話データ（8〜13件）
    {
      id: string,              // "c1" 〜
      speaker: string,         // 話者名（例: "健"、"玲"、"飛虎"）
      is_learner: boolean,     // 学習者パート（健）かどうか
      chinese: string,
      pinyin: string,
      japanese: string,
      audio: string,           // 音声パス /audio/lesson01/conv_01.mp3
      panel_id: number         // 対応するマンガコマ番号
    }
  ],

  ken_monologue: string,       // 健の独白テキスト
  study_notes: string[]        // 学習メモ（5件固定）
}
```

### 全40課の統計
| 項目 | 数値 |
|---|---|
| shadowing_base 総計 | 301件 |
| conversation 総計 | 385件 |
| manga_panels 総計 | 160件（各4件×40課） |
| JSON構文エラー | 0件 |

---

### ✅ Phase 1 MVP：完全完了

| ステップ | 内容 | 状態 |
|---|---|---|
| **Step B** | Next.js基本UI構築（44ページ・4タブ） | ✅ 完了 |
| **Step D-1** | 進捗管理（localStorage・`useProgress.ts`） | ✅ 完了 |
| **Step D-2** | 会話ハイライト・折りたたみ（`ConversationPanel.tsx`） | ✅ 完了 |
| **Step C** | 音声生成（686ファイル・Failed 0・`cmn-CN-Wavenet-B`） | ✅ 完了 |
| **Step C'** | 🔊ボタン有効化（`useAudio.ts`・`useSyncExternalStore`） | ✅ 完了 |

#### Step B の実装概要
- 課一覧 `/`（40枚の `LessonCard`・進捗ゲージ）
- 課詳細 `/lesson/[id]`（`generateStaticParams` で40課を静的生成、計44ページ）
- 4タブ：ストーリー / シャドーイング / 会話練習 / 学習メモ
- マンガ画像は `public/placeholder.svg` をダミー表示（`imageUtils.ts`）
- フォント：`Noto Sans JP` / `Noto Sans SC`、`lang="ja"`

#### Step D-1 の実装概要
- localStorage キー：`chi-app-progress`
- 課一覧に完了バッジ（✅）・進捗ゲージ連動
- 課詳細下部「この課を完了にする」→ 完了後1秒で一覧へ自動遷移

#### Step C の実装概要
- スクリプト：`scripts/generate_audio.ts`
- 実行：`npm run generate:audio`（内部で `ts-node --project tsconfig.scripts.json`）
- 環境変数：`GOOGLE_CLOUD_TTS_API_KEY`（`.env.local`）
- ボイス：Primary `cmn-CN-Wavenet-B`、Fallback `cmn-CN-Standard-B`（言語コード `cmn-CN`）
  - ※ Google Cloud API の正式名は `cmn-CN-*`。ドキュメント上の `zh-CN-Wavenet-B` 相当
- 出力：`public/audio/lesson01/` 〜 `lesson40/`（MP3 **686ファイル**、生成失敗 **0件**）

#### Step C' の実装概要
- `useAudio.ts`：グローバル単一 `Audio` インスタンス、`play` / `stop` / `isPlaying`
- `ConversationPanel`・`ShadowingPlayer` の 🔊 ボタン有効化（再生中は ⏸ 表示）

---

### 作成済みファイル一覧

```
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── lesson/[id]/page.tsx
├── components/
│   ├── LessonCard.tsx
│   ├── LessonListClient.tsx
│   ├── LessonDetailClient.tsx
│   ├── LessonCompleteSection.tsx
│   ├── ConversationPanel.tsx
│   ├── MangaPanel.tsx
│   ├── ProgressBar.tsx
│   ├── ShadowingPlayer.tsx
│   └── StudyNotes.tsx
├── hooks/
│   ├── useProgress.ts
│   └── useAudio.ts
├── lib/
│   ├── lessonLoader.ts
│   ├── imageUtils.ts
│   └── cn.ts
├── types/
│   └── lesson.ts
└── data/
    └── lesson01.json 〜 lesson40.json

scripts/
└── generate_audio.ts

tsconfig.scripts.json
public/
├── placeholder.svg
└── audio/
    └── lesson01/ 〜 lesson40/（MP3 686ファイル）
```

---

## 開発ロードマップ（残タスク）

### 🟢 Phase 2：Vercel デプロイ（本番公開）— 次フェーズ

| 作業 | 内容 |
|---|---|
| Vercel プロジェクト作成 | GitHub リポジトリ連携 |
| 環境変数 | 本番用設定（必要に応じて） |
| デプロイ確認 | `/`・`/lesson/[id]`・音声静的配信の動作確認 |

### 🟡 Phase 2 コンテンツ（中優先度）

| ステップ | 作業内容 | ツール |
|---|---|---|
| **Step E** | コマ割り漫画イラスト作成（1課あたり3〜4コマ） | AI画像生成 |
| **Step F** | 全40課データ投入・動作確認（`public/images/` へ実画像配置） | Claude + Next.js |

### 🔵 Phase 3 拡張機能（低優先度）

| ステップ | 作業内容 | ツール |
|---|---|---|
| **Step G** | 録音・採点機能（Web Audio API） | Web Audio API |
| **Step H** | 単語帳・フラッシュカード機能 | React / localStorage |
| **Step I** | ダークモード対応 | CSS Variables / Next.js |

---

## ストーリー・登場人物メモ

### あらすじ
22歳の大学生・健（ケン）が「中原大陸」という中国語しか通じない異世界に転生。
頭の中の「言語習得システム」で中国語を学ぶごとにスキルポイントが貯まる。
帰国条件は「言語習得レベルMAX達成」。

### 主要登場人物
| 名前 | 読み | 役割 | 登場課 |
|---|---|---|---|
| 健（Jiàn） | ケン | 主人公・22歳日本人大学生 | 全課 |
| 玲（Líng） | リン | 17歳の村娘・最初の中国語の先生 | 第1〜37課 |
| 老王（Lǎo Wáng） | ラオワン | 商人のおじさん・買い物シーン担当 | 第3課〜 |
| 飛虎（Fēi Hǔ） | フェイフー | 謎の武術家・クールキャラ・指名手配の秘密 | 第4課〜 |
| 药婆（Yào Pó） | ヤオポー | 薬草師のおばあさん・医療シーン担当 | 第9課〜 |
| 铃铛（Líng Dāng） | リンダン | 飛虎の妹・大学生設定・日常会話担当 | 第6課〜 |

### 上巻（第1〜20課）ポイント
- 健が村に転生→玲・老王・飛虎・鈴鐺と出会う
- 隣町での買い物・両替・交通を経て龍泉城へ
- 云海先生という武術大師の謎が浮上

### 下巻（第21〜40課）ポイント
- 龍泉城滞在→山越えの旅→温泉の村・暖泉郷→雲霞鎮→天水城
- 飛虎の過去（父の死・三年間の試合忌避）が明かされる
- 第37課で玲が離脱、第39課で飛虎が離脱
- 第40課で言語習得レベルMAX達成→帰還

---

## 音声・画像のパス規則

```
/audio/lesson{02d}/shadow_{02d}.mp3   // シャドーイング音声（配置済み）
/audio/lesson{02d}/conv_{02d}.mp3     // 会話音声（配置済み）
/images/lesson{02d}/panel_{02d}.jpg   // マンガコマ画像（未配置・placeholder 使用中）
```

例：
```
/audio/lesson01/shadow_01.mp3
/audio/lesson01/conv_01.mp3
/images/lesson01/panel_01.jpg
```

---

## 学習コンテンツの仕様

### シャドーイング練習
- 各課7〜9フレーズ
- 音声を聞いて→繰り返す形式
- `shadowing_base` 配列から生成
- 🔊 ボタンで再生（「次へ」で音声停止）

### 会話練習
- 各課8〜13セリフ
- `is_learner: true` のセリフが健（学習者）パート
- 役割を交換して練習する形式（仕様書記載）
- `panel_id` で対応するマンガコマと紐付け
- 健パート：右寄せ・青系背景／NPC：左寄せ・グレー背景
- 中国語タップでピンイン・日本語を折りたたみ表示
- 🔊 ボタンで再生

### 学習メモ
- 各課5件固定
- 4件が文法ポイント、最後の1件が新出語彙

---

## 技術仕様

### スタック
| 項目 | 内容 |
|---|---|
| フレームワーク | Next.js 16.2.7（App Router） |
| 言語 | TypeScript（strict モード） |
| スタイリング | Tailwind CSS v4 |
| 状態管理 | React useState（進捗・UI）／`useSyncExternalStore`（音声再生） |
| 永続化 | localStorage（学習進捗・完了フラグ） |
| 音声 | Google Cloud TTS → `public/audio/`（686 MP3 配置済み）／再生は `useAudio` |
| 画像 | `public/images/`（Phase 2 コンテンツで投入予定）／現状 `placeholder.svg` |
| データ | `src/data/lesson{01-40}.json`（型：`src/types/lesson.ts` の `Lesson`） |

### フォルダ構成（現状）
```
src/
├── app/
│   ├── page.tsx                    # 課一覧ページ（トップ）
│   ├── layout.tsx
│   ├── globals.css
│   └── lesson/
│       └── [id]/
│           └── page.tsx            # 課詳細ページ
├── components/
│   ├── LessonCard.tsx
│   ├── LessonListClient.tsx        # 一覧・進捗（Client）
│   ├── LessonDetailClient.tsx      # 4タブ（Client）
│   ├── LessonCompleteSection.tsx   # 課完了ボタン（Client）
│   ├── MangaPanel.tsx
│   ├── ConversationPanel.tsx
│   ├── ShadowingPlayer.tsx
│   ├── StudyNotes.tsx
│   └── ProgressBar.tsx
├── data/
│   └── lesson01.json 〜 lesson40.json
├── types/
│   └── lesson.ts
├── hooks/
│   ├── useProgress.ts              # 学習進捗（localStorage）
│   └── useAudio.ts                 # 音声再生（グローバル単一 Audio）
└── lib/
    ├── lessonLoader.ts
    ├── imageUtils.ts
    └── cn.ts

scripts/
└── generate_audio.ts

public/
├── placeholder.svg
└── audio/lesson01/ 〜 lesson40/
```

### コーディング規約
- **TypeScript strict** モードを厳守（`any` 禁止）
- **Next.js App Router** を使用（`pages/` ディレクトリは使わない）
- **再利用可能コンポーネント設計**（props で汎用化、課固有ロジックを外に出す）
- `'use client'` は最小限のコンポーネントにのみ付与
- データ取得は Server Component で行い、インタラクション部分のみ Client Component に切り出す

### JSONデータ読み込み例
```typescript
// lib/lessonLoader.ts
import type { Lesson } from '@/types/lesson';

export async function getLesson(id: number): Promise<Lesson | null> {
  const padded = String(id).padStart(2, '0');
  const data = await import(`@/data/lesson${padded}.json`);
  return data.default as Lesson;
}

export async function getAllLessons(): Promise<Lesson[]> {
  const lessons = await Promise.all(
    Array.from({ length: 40 }, (_, i) => getLesson(i + 1)),
  );
  return lessons.filter((lesson): lesson is Lesson => lesson !== null);
}
```

### localStorage スキーマ（進捗管理）
```typescript
// キー: 'chi-app-progress'
type ProgressData = {
  completedLessons: number[];        // 完了済みの課番号リスト
  lastAccessedLesson: number;        // 最後にアクセスした課番号
  updatedAt: string;                 // ISO 8601形式
};
```

### 音声生成スクリプト
```bash
# .env.local に GOOGLE_CLOUD_TTS_API_KEY を設定
npm run generate:audio
```

---

## UI仕様

### 全体デザインコンセプト
- **ゲームUI風**：スキルポイント・ゲージ・ポップアップなど、RPGの演出を取り入れる
- **モバイルファースト**：スマートフォンでの学習を主想定（幅 375px 基準）
- **シンプルで読みやすい**：中国語・ピンイン・日本語の3行表示が基本

### 課一覧ページ（`/`）
- 第1〜40課をカード形式で表示
- 各カードに表示する情報：課番号・タイトル・テーマ・HSKレベル・完了バッジ
- 完了済み課にはチェックマーク（✅）を表示
- 上部に全体の進捗ゲージ（完了課数 / 40課）を表示

### 課詳細ページ（`/lesson/[id]`）
タブ切り替えで以下の4セクションを表示：

| タブ | 内容 |
|---|---|
| 📖 ストーリー | 場面描写テキスト → マンガコマ（4枚・placeholder）→ 健の独白 |
| 🎙 シャドーイング | 音声再生・フレーズ表示（中国語・ピンイン・日本語） |
| 💬 会話練習 | 吹き出し形式の会話表示（健パートハイライト・折りたたみ） |
| 📝 学習メモ | 文法ポイント5件のリスト表示 |

課詳細下部：**「この課を完了にする」** → 完了後「完了しました！一覧に戻ります…」→ 1秒後に `/` へ遷移

### 会話表示の仕様（ConversationPanel）— 実装済み
- `is_learner: true`（健パート）→ **右寄せ・青系背景**（`bg-blue-100` / `border-blue-300`）
- `is_learner: false`（NPCパート）→ **左寄せ・グレー背景**
- 各セリフに音声再生ボタン（🔊 / 再生中 ⏸）
- ピンイン・日本語訳は折りたたみ（中国語タップで展開）

### シャドーイングプレイヤーの仕様（ShadowingPlayer）— 実装済み
- 1フレーズずつ表示（前後ナビゲーションボタン）
- 🔊 で音声再生（再生中 ⏸）
- 中国語・ピンイン・日本語を縦に並べて表示
- 「次へ」で次フレーズへ（遷移時に音声停止）

### スキルUIの演出（ゲーム風）
- トップページの進捗ゲージに「言語習得システム」の名称を使用
- フォント：Noto Sans JP（日本語）／ Noto Sans SC（中国語）

---

## 次のアクション（Phase 2：Vercel デプロイ）

1. GitHub リポジトリへプッシュ
2. Vercel でプロジェクトをインポート・デプロイ
3. 本番 URL で以下を確認
   - 課一覧・課詳細・4タブ
   - `public/audio/` 配下の MP3 再生
   - localStorage による進捗保存
4. （任意）カスタムドメイン設定

その後、**Step E / F**（漫画イラスト・`public/images/` 投入）に進む。

---

## 実装履歴（Phase 1）

実装順序（実績）：**Step B → Step D-1 → Step D-2 → Step C → Step C'**

### 実装時の遵守事項
- **TypeScript strict** モードを厳守すること（`tsconfig.json` の `"strict": true` を外さない）
- **Next.js App Router** を使用すること（`pages/` ディレクトリは作らない）
- **再利用可能コンポーネント設計**を徹底すること（1コンポーネント1責務、props で汎用化）
