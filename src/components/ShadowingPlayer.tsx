"use client";

import { ChevronLeft, ChevronRight, Pause, Volume2 } from "lucide-react";
import { useState } from "react";
import type { ShadowingItem } from "@/types/lesson";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/cn";

type ShadowingPlayerProps = {
  items: ShadowingItem[];
};

export function ShadowingPlayer({ items }: ShadowingPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { play, stop, isPlaying } = useAudio();

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500">
        シャドーイングデータがありません。
      </p>
    );
  }

  const currentItem = items[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;
  const playing = isPlaying(currentItem.audio);

  function goPrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function goNext() {
    stop();
    setCurrentIndex((index) => Math.min(items.length - 1, index + 1));
  }

  function handleAudioClick() {
    if (playing) {
      stop();
      return;
    }
    play(currentItem.audio);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center text-xs font-medium text-slate-500">
        {currentIndex + 1} / {items.length}
      </div>

      <div className="rounded-2xl border-2 border-sky-200 bg-white px-6 py-8 text-center shadow-sm">
        <p className="font-sc text-3xl font-bold leading-relaxed text-slate-900">
          {currentItem.chinese}
        </p>
        <p className="mt-3 text-lg text-slate-600">{currentItem.pinyin}</p>
        <p className="mt-2 text-base text-slate-500">{currentItem.japanese}</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={goPrevious}
          disabled={isFirst}
          aria-label="前のフレーズ"
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white transition-colors",
            isFirst
              ? "cursor-not-allowed opacity-40"
              : "hover:border-sky-400 hover:bg-sky-50",
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={handleAudioClick}
          title="音声を再生"
          aria-label={playing ? "音声を停止" : "音声を再生"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white transition-colors hover:bg-sky-600"
        >
          {playing ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Volume2 className="h-7 w-7" />
          )}
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          aria-label="次のフレーズ"
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white transition-colors",
            isLast
              ? "cursor-not-allowed opacity-40"
              : "hover:border-sky-400 hover:bg-sky-50",
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <button
        type="button"
        onClick={goNext}
        disabled={isLast}
        className={cn(
          "w-full rounded-xl py-3 text-sm font-bold transition-colors",
          isLast
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-emerald-500 text-white hover:bg-emerald-600",
        )}
      >
        次へ
      </button>
    </div>
  );
}
