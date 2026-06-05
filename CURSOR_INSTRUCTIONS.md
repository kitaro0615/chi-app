# Cursor 実装指示書
## 異世界転生中文学習アプリ（chi-app）

---

## 事前準備

### ファイル配置
以下のファイルをプロジェクト直下に配置する。

```
chi-app/
├─ src/
├─ public/
├─ package.json
├─ README.md
├─ PROJECT_HANDOVER.md        ← 引き継ぎ情報（必須）
└─ CURSOR_INSTRUCTIONS.md     ← 本ファイル
```

> ⚠️ `引き継ぎ情報_Cursor用.md` は `PROJECT_HANDOVER.md` にリネームして配置すること。

---

## ② Cursor への最初の指示（計画フェーズ）

**モード：Agent モード**

```
まず PROJECT_HANDOVER.md を読んでください。

その後、

1. 現在のプロジェクト構成を確認
2. 引継ぎ内容との整合性を確認
3. 不足ファイルを洗い出す
4. src/types/lesson.ts の既存型定義を確認する
5. Step B（Next.js基本UI構築）の実装計画を作成

コード変更はまだ行わず、
実装計画のみを提示してください。
```

> ✅ Cursor は自動的に `src/app`・`src/components`・`src/data` を調査します。
> 計画内容を確認・承認してから次のステップへ進んでください。

---

## ③ Step B 実装指示

**計画を確認・承認後に実行する。**

**モード：Agent モード**

```
PROJECT_HANDOVER.md の内容に従って
Step B を実装してください。

以下を作成してください。

- src/lib/lessonLoader.ts（JSONデータ読み込みユーティリティ）
- 課一覧ページ（src/app/page.tsx）
- 課詳細ページ（src/app/lesson/[id]/page.tsx）
- src/components/MangaPanel.tsx
- src/components/ConversationPanel.tsx
- src/components/ShadowingPlayer.tsx

制約：
- 音声ファイルは未配置のためAudioPlayerはスキップ
- ダミー画像はNext.js標準のplaceholder.svgを使用
- TypeScript strict / App Router / 再利用設計を厳守

実装後は変更したファイル一覧を報告してください。
```

---

## ④ Step D-1 実装指示（Step B 完了後）

**モード：Agent モード**

```
PROJECT_HANDOVER.md の内容に従って
Step D-1（進捗管理機能）を実装してください。

以下を作成してください。

- src/hooks/useProgress.ts（localStorageで学習進捗を管理するフック）

仕様：
- キー名：'chi-app-progress'
- 保存内容：完了済み課番号リスト・最終アクセス課番号・更新日時
- 課一覧ページの進捗ゲージに反映
- 課完了時に completedLessons へ追加する関数を提供

実装後は変更したファイル一覧を報告してください。
```

---

## ⑤ Step D-2 実装指示（Step D-1 完了後）

**モード：Agent モード**

```
PROJECT_HANDOVER.md の内容に従って
Step D-2（学習者パートのハイライト表示）を実装してください。

対象コンポーネント：
- src/components/ConversationPanel.tsx

仕様：
- is_learner: true（健パート）→ 右寄せ・青系背景でハイライト
- is_learner: false（NPCパート）→ 左寄せ・グレー背景
- ピンイン・日本語訳はタップで展開する折りたたみ表示
- 各セリフに音声再生ボタン（🔊）を配置（音声未配置のため非活性でOK）

実装後は変更したファイル一覧を報告してください。
```

---

## ⑥ Step C 実装指示（Step D-2 完了後）

**モード：Agent モード**

```
PROJECT_HANDOVER.md の内容に従って
Step C（Google Cloud TTS 連携）を実装してください。

以下を作成してください。

- scripts/generate_audio.ts（音声MP3を事前生成するスクリプト）

仕様：
- src/data/lesson01.json 〜 lesson40.json を読み込む
- shadowing_base・conversation の各フレーズを TTS で音声生成
- 生成したMP3を public/audio/lesson{01-40}/ に保存
- 言語：zh-CN（中国語）・話者：standard または wavenet
- 既存ファイルはスキップ（上書きしない）

事前確認事項：
- GOOGLE_CLOUD_TTS_API_KEY が .env.local に設定済みであること
- 実行コマンド：npx ts-node scripts/generate_audio.ts

実装後は変更したファイル一覧を報告してください。
```

---

## 実装順序まとめ

```
② 計画確認
    ↓
③ Step B：Next.js基本UI構築
    ↓
④ Step D-1：進捗管理機能（localStorage）
    ↓
⑤ Step D-2：学習者パートのハイライト表示
    ↓
⑥ Step C：Google Cloud TTS 音声生成
```

> 各ステップ完了後は必ず `npm run build` でビルドエラーがないことを確認してから次へ進む。

---

## 遵守事項（全ステップ共通）

- **TypeScript strict** モードを厳守（`any` 禁止）
- **Next.js App Router** を使用（`pages/` ディレクトリは作らない）
- **再利用可能コンポーネント設計**を徹底（1コンポーネント1責務）
- `'use client'` は最小限のコンポーネントにのみ付与
- 既存ファイル（`src/types/lesson.ts` 等）は上書き前に必ず内容を確認する
