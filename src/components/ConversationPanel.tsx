"use client";

import { Pause, Volume2 } from "lucide-react";
import { useState } from "react";
import type { ConversationLine } from "@/types/lesson";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/cn";

type ConversationPanelProps = {
  lines: ConversationLine[];
};

export function ConversationPanel({ lines }: ConversationPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {lines.map((line) => (
        <ConversationBubble key={line.id} line={line} />
      ))}
    </div>
  );
}

type ConversationBubbleProps = {
  line: ConversationLine;
};

// 発声ボタン：44×44pxの円形・常に左端に固定
function ConversationAudioButton({ src }: { src: string }) {
  const { play, stop, isPlaying } = useAudio();
  const playing = isPlaying(src);

  function handleClick() {
    if (playing) {
      stop();
      return;
    }
    play(src);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={playing ? "音声を停止" : "音声を再生"}
      className={cn(
        // 44×44px固定サイズ・円形・縮まない
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
        "border transition-colors",
        playing
          ? "border-blue-400 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
          : "border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700",
      )}
    >
      {playing ? (
        <Pause className="h-5 w-5" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </button>
  );
}

function ConversationBubble({ line }: ConversationBubbleProps) {
  const isLearner = line.is_learner;
  const [expanded, setExpanded] = useState(false);

  return (
    // ボタンと吹き出しを横並びにする・常に左端にボタン
    <div className="flex w-full items-start gap-3">

      {/* 発声ボタン：左端に固定（健もNPCも同じ位置） */}
      <ConversationAudioButton src={line.audio} />

      {/* 吹き出し：話者によって色を変える */}
      <div
        className={cn(
          "flex-1 rounded-2xl border-2 px-4 py-3",
          isLearner
            ? "border-blue-300 bg-blue-100 dark:border-blue-600 dark:bg-blue-900/50"
            : "border-slate-200 bg-slate-100 dark:border-gray-400 dark:bg-slate-600",
        )}
      >
        {/* 話者名 */}
        <p
          className={cn(
            "mb-1 text-xs font-bold",
            isLearner ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-gray-100",
          )}
        >
          {line.speaker}
        </p>

        {/* 中国語テキスト：タップでピンイン・日本語を展開 */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "ピンインと日本語訳を閉じる" : "ピンインと日本語訳を表示"}
          className={cn(
            "w-full text-left font-sc text-lg font-bold leading-relaxed",
            "rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            isLearner
              ? "focus-visible:outline-blue-400"
              : "focus-visible:outline-slate-400 dark:text-white",
          )}
        >
          {line.chinese}
        </button>

        {/* ピンイン・日本語訳（展開時のみ表示） */}
        {expanded && (
          <div className="mt-2 border-t border-black/10 pt-2 dark:border-white/10">
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{line.pinyin}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{line.japanese}</p>
          </div>
        )}
      </div>
    </div>
  );
}