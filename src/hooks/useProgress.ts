"use client";

import { useCallback, useEffect, useState } from "react";

export const PROGRESS_STORAGE_KEY = "chi-app-progress";

const TOTAL_LESSONS = 40;

export type ProgressData = {
  completedLessons: number[];
  lastAccessedLesson: number;
  updatedAt: string;
};

const EMPTY_PROGRESS: ProgressData = {
  completedLessons: [],
  lastAccessedLesson: 0,
  updatedAt: new Date(0).toISOString(),
};

function isValidLessonId(id: number): boolean {
  return Number.isInteger(id) && id >= 1 && id <= TOTAL_LESSONS;
}

function isProgressData(value: unknown): value is ProgressData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    Array.isArray(record.completedLessons) &&
    record.completedLessons.every(
      (lessonId) => typeof lessonId === "number" && isValidLessonId(lessonId),
    ) &&
    typeof record.lastAccessedLesson === "number" &&
    typeof record.updatedAt === "string"
  );
}

function normalizeProgress(data: ProgressData): ProgressData {
  const uniqueCompleted = [...new Set(data.completedLessons)]
    .filter(isValidLessonId)
    .sort((a, b) => a - b);

  return {
    completedLessons: uniqueCompleted,
    lastAccessedLesson: isValidLessonId(data.lastAccessedLesson)
      ? data.lastAccessedLesson
      : 0,
    updatedAt: data.updatedAt,
  };
}

function readProgressFromStorage(): ProgressData {
  if (typeof window === "undefined") {
    return EMPTY_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return EMPTY_PROGRESS;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isProgressData(parsed)) {
      return EMPTY_PROGRESS;
    }

    return normalizeProgress(parsed);
  } catch {
    return EMPTY_PROGRESS;
  }
}

function writeProgressToStorage(data: ProgressData): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
}

export function useProgress() {
  const [progressData, setProgressData] = useState<ProgressData>(EMPTY_PROGRESS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setProgressData(readProgressFromStorage());
    setIsReady(true);
  }, []);

  const completeLesson = useCallback(
    (id: number) => {
      if (!isValidLessonId(id)) {
        return;
      }

      setProgressData((current) => {
        if (current.completedLessons.includes(id)) {
          return current;
        }

        const next: ProgressData = normalizeProgress({
          completedLessons: [...current.completedLessons, id],
          lastAccessedLesson: id,
          updatedAt: new Date().toISOString(),
        });

        writeProgressToStorage(next);
        return next;
      });
    },
    [],
  );

  const recordLessonAccess = useCallback(
    (id: number) => {
      if (!isValidLessonId(id)) {
        return;
      }

      setProgressData((current) => {
        if (current.lastAccessedLesson === id) {
          return current;
        }

        const next: ProgressData = normalizeProgress({
          ...current,
          lastAccessedLesson: id,
          updatedAt: new Date().toISOString(),
        });

        writeProgressToStorage(next);
        return next;
      });
    },
    [],
  );

  const isCompleted = useCallback(
    (id: number) => progressData.completedLessons.includes(id),
    [progressData.completedLessons],
  );

  const progress = progressData.completedLessons.length;

  return {
    progressData,
    progress,
    isReady,
    completeLesson,
    recordLessonAccess,
    isCompleted,
  };
}
