"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/cn";

type LessonCompleteSectionProps = {
  lessonId: number;
};

export function LessonCompleteSection({ lessonId }: LessonCompleteSectionProps) {
  const router = useRouter();
  const { completeLesson, isCompleted, isReady, recordLessonAccess } =
    useProgress();
  const [pendingRedirect, setPendingRedirect] = useState(false);

  useEffect(() => {
    recordLessonAccess(lessonId);
  }, [lessonId, recordLessonAccess]);

  useEffect(() => {
    if (!pendingRedirect) {
      return;
    }

    const timer = setTimeout(() => {
      router.push("/");
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [pendingRedirect, router]);

  const completed = isReady && isCompleted(lessonId);

  function handleComplete() {
    completeLesson(lessonId);
    setPendingRedirect(true);
  }

  const buttonLabel = pendingRedirect
    ? "完了しました！一覧に戻ります…"
    : completed
      ? "✅ この課は完了済みです"
      : "この課を完了にする";

  return (
    <section className="rounded-xl border-2 border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-800 dark:bg-slate-800">
      <button
        type="button"
        onClick={handleComplete}
        disabled={!isReady || completed || pendingRedirect}
        className={cn(
          "w-full rounded-xl py-3 text-sm font-bold transition-colors",
          pendingRedirect || completed
            ? "cursor-default bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            : "bg-emerald-500 text-white hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60",
        )}
      >
        {buttonLabel}
      </button>
    </section>
  );
}
