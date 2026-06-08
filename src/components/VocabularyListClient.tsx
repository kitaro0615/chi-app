"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lesson } from "@/types/lesson";

// localStorage から取り出すデータの型（useVocabulary と同じ構造）
type VocabProgress = {
  masteredIds: string[];
};

/**
 * 指定レッスンの「覚えた」カード枚数を localStorage から読み取る
 */
function getMasteredCount(lessonId: number): number {
  try {
    const raw = localStorage.getItem(`chi-app-vocab-${lessonId}`);
    if (!raw) return 0;
    const data = JSON.parse(raw) as VocabProgress;
    return data.masteredIds?.length ?? 0;
  } catch {
    return 0;
  }
}

type VocabularyListClientProps = {
  lessons: Lesson[];
};

/**
 * 単語帳トップページのレッスン一覧。
 * 各レッスンの「覚えた / 全単語数」を localStorage から取得して表示する。
 */
export function VocabularyListClient({ lessons }: VocabularyListClientProps) {
  // レッスンIDをキーとした「覚えた枚数」のマップ
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  // localStorage の読み込み完了フラグ
  const [isReady, setIsReady] = useState(false);

  // マウント後に全レッスンの進捗を一括読み込み
  useEffect(() => {
    const map: Record<number, number> = {};
    for (const lesson of lessons) {
      map[lesson.id] = getMasteredCount(lesson.id);
    }
    setProgressMap(map);
    setIsReady(true);
  }, [lessons]);

  return (
    <div className="flex flex-col gap-3">
      {lessons.map((lesson) => {
        // 全単語数（shadowing_base の件数）
        const total = lesson.shadowing_base.length;
        // 覚えた枚数（ロード前は 0 を表示してちらつきを防ぐ）
        const mastered = isReady ? (progressMap[lesson.id] ?? 0) : 0;
        // 全て覚えたかどうか
        const isAllMastered = isReady && total > 0 && mastered >= total;

        return (
          <Link
            key={lesson.id}
            href={`/vocabulary/${lesson.id}`}
            className="block rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-sky-400 hover:shadow-md active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-600"
          >
            <div className="flex items-center gap-3">
              {/* 左側：課番号・タイトル・テーマ */}
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                    第{lesson.id}課
                  </span>
                  {/* 全カード習得済みのときに完了バッジを表示 */}
                  {isAllMastered && (
                    <span className="text-sm" aria-label="全て覚えた">
                      ✅
                    </span>
                  )}
                </div>
                <p className="font-sc font-bold text-slate-900 dark:text-slate-100 truncate">
                  {lesson.title}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {lesson.theme}
                </p>
              </div>

              {/* 右側：進捗数値 */}
              <div className="shrink-0 text-right">
                <p
                  className={`text-lg font-bold ${
                    isAllMastered
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-sky-600 dark:text-sky-400"
                  }`}
                >
                  {mastered}
                  <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    {" "}/ {total}
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">覚えた</p>
              </div>
            </div>

            {/* 進捗バー */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: total > 0 ? `${(mastered / total) * 100}%` : "0%",
                }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
