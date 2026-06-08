"use client";

import { LessonCard } from "@/components/LessonCard";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/hooks/useProgress";
import type { Lesson } from "@/types/lesson";

type LessonListClientProps = {
  lessons: Lesson[];
};

export function LessonListClient({ lessons }: LessonListClientProps) {
  const { progress, isCompleted, isReady } = useProgress();

  const completedCount = isReady ? progress : 0;

  return (
    <>
      <ProgressBar completed={completedCount} total={lessons.length} />

      <section>
        <h2 className="mb-3 text-sm font-bold text-slate-600 dark:text-slate-400">レッスン一覧</h2>
        <div className="flex flex-col gap-3">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              completed={isReady && isCompleted(lesson.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
