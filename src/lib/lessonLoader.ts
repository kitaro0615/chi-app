import type { Lesson } from "@/types/lesson";

const LESSON_COUNT = 40;

function padLessonId(id: number): string {
  return String(id).padStart(2, "0");
}

export function isValidLessonId(id: number): boolean {
  return Number.isInteger(id) && id >= 1 && id <= LESSON_COUNT;
}

export async function getLesson(id: number): Promise<Lesson | null> {
  if (!isValidLessonId(id)) {
    return null;
  }

  const padded = padLessonId(id);
  const data = await import(`@/data/lesson${padded}.json`);
  return data.default as Lesson;
}

export async function getAllLessons(): Promise<Lesson[]> {
  const lessons = await Promise.all(
    Array.from({ length: LESSON_COUNT }, (_, index) => getLesson(index + 1)),
  );

  return lessons.filter((lesson): lesson is Lesson => lesson !== null);
}

export function getLessonIds(): number[] {
  return Array.from({ length: LESSON_COUNT }, (_, index) => index + 1);
}
