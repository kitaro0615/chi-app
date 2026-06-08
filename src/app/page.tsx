import { DarkModeToggle } from "@/components/DarkModeToggle";
import { LessonListClient } from "@/components/LessonListClient";
import { getAllLessons } from "@/lib/lessonLoader";

export default async function HomePage() {
  const lessons = await getAllLessons();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-sky-600">異世界転生中文学習</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">chi-app</h1>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      <LessonListClient lessons={lessons} />
    </div>
  );
}
