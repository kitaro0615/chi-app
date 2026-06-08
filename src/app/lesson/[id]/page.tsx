import Link from "next/link";
import { notFound } from "next/navigation";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { LessonCompleteSection } from "@/components/LessonCompleteSection";
import { LessonDetailClient } from "@/components/LessonDetailClient";
import { getLesson, getLessonIds, isValidLessonId } from "@/lib/lessonLoader";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getLessonIds().map((id) => ({ id: String(id) }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!isValidLessonId(id)) {
    notFound();
  }

  const lesson = await getLesson(id);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            ← レッスン一覧
          </Link>
          <DarkModeToggle />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
            第{lesson.id}課
          </span>
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            HSK {lesson.hsk_level}
          </span>
        </div>
        <h1 className="font-sc text-2xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{lesson.theme}</p>
        <div className="flex flex-wrap gap-1.5">
          {lesson.grammar.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {item}
            </span>
          ))}
        </div>
      </header>

      <LessonDetailClient lesson={lesson} />

      <LessonCompleteSection lessonId={lesson.id} />
    </div>
  );
}
