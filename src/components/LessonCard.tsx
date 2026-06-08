import Link from "next/link";
import type { Lesson } from "@/types/lesson";
import { cn } from "@/lib/cn";

type LessonCardProps = {
  lesson: Lesson;
  completed?: boolean;
};

export function LessonCard({ lesson, completed = false }: LessonCardProps) {
  return (
    <Link
      href={`/lesson/${lesson.id}`}
      className={cn(
        "block rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm transition-colors",
        "hover:border-sky-400 hover:shadow-md active:scale-[0.99]",
        "dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-600",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
          第{lesson.id}課
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            HSK {lesson.hsk_level}
          </span>
          {completed && (
            <span className="text-sm" aria-label="完了">
              ✅
            </span>
          )}
        </div>
      </div>
      <h2 className="font-sc text-lg font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{lesson.theme}</p>
    </Link>
  );
}
