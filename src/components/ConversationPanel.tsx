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
      title="音声を再生"
      aria-label={playing ? "音声を停止" : "音声を再生"}
      className="shrink-0 rounded-full p-1 text-slate-600 transition-colors hover:bg-black/5"
    >
      {playing ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  );
}

function ConversationBubble({ line }: ConversationBubbleProps) {
  const isLearner = line.is_learner;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn("flex w-full", isLearner ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border-2 px-4 py-3 shadow-sm",
          isLearner
            ? "rounded-br-sm border-blue-300 bg-blue-100 text-slate-900"
            : "rounded-bl-sm border-gray-300 bg-gray-100 text-slate-900",
        )}
      >
        <div className="mb-2 flex w-full items-start justify-between gap-2">
          {isLearner ? (
            <>
              <ConversationAudioButton src={line.audio} />
              <span className="text-xs font-bold text-blue-700">{line.speaker}</span>
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-gray-600">{line.speaker}</span>
              <ConversationAudioButton src={line.audio} />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-label={
            expanded
              ? "ピンインと日本語訳を閉じる"
              : "ピンインと日本語訳を表示"
          }
          className={cn(
            "w-full text-left font-sc text-lg font-bold leading-relaxed",
            "cursor-pointer rounded-md transition-colors",
            "hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            isLearner
              ? "focus-visible:outline-blue-400"
              : "focus-visible:outline-gray-400",
          )}
        >
          {line.chinese}
        </button>

        {expanded && (
          <div className="mt-2 border-t border-black/10 pt-2">
            <p className="text-xs leading-relaxed text-gray-500">{line.pinyin}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              {line.japanese}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
