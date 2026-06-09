import Link from "next/link";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { VocabularyListClient } from "@/components/VocabularyListClient";
import { getAllLessons } from "@/lib/lessonLoader";

// 単語帳トップページ：全40課のレッスン一覧と覚えた枚数を表示する
export default async function VocabularyPage() {
  // サーバー側で全レッスンデータを取得する（Next.js App Router のサーバーコンポーネント）
  const lessons = await getAllLessons();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            {/* ホームへ戻るリンク */}
            <Link
              href="/"
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              ← レッスン一覧
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              単語帳
            </h1>
          </div>
          {/* ダークモード切り替えボタン */}
          <DarkModeToggle />
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-100">
          レッスンを選んでフラッシュカードで単語を練習しよう
        </p>
      </header>

      {/*
       * クライアントコンポーネントに lessons を渡す。
       * 各レッスンの「覚えた枚数」は localStorage から読むため
       * クライアント側で処理する。
       */}
      <VocabularyListClient lessons={lessons} />
    </div>
  );
}
