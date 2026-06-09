"use client";

import { ChevronLeft, ChevronRight, Pause, Volume2 } from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import type { ConversationLine } from "@/types/lesson";
import {
  type ConversationViewMode,
  useConversationViewMode,
} from "@/hooks/useConversationViewMode";
import {
  type AutoPlayStatus,
  useConversationAutoPlay,
} from "@/hooks/useConversationAutoPlay";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/cn";

type ConversationPanelProps = {
  lines: ConversationLine[];
};

export function ConversationPanel({ lines }: ConversationPanelProps) {
  const { mode, setViewMode, isReady } = useConversationViewMode();
  const { stop } = useAudio();

  // ステップ表示・一覧表示で共有する「現在のセリフ番号」（0始まり）
  const [currentIndex, setCurrentIndex] = useState(0);

  // 一覧表示の自動再生（フックは条件分岐の外で常に呼び出す）
  const autoPlay = useConversationAutoPlay({
    lines,
    setCurrentIndex,
  });

  // ステップ表示に切り替えたら自動再生を停止する
  useEffect(() => {
    if (mode !== "overview") {
      autoPlay.stopAutoPlay();
    }
  }, [mode, autoPlay.stopAutoPlay]);

  if (lines.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        会話データがありません。
      </p>
    );
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === lines.length - 1;

  /** 指定したセリフ番号へ移動する（一覧表示のタップ用） */
  function goToIndex(index: number) {
    setCurrentIndex(Math.max(0, Math.min(lines.length - 1, index)));
  }

  /** 手動操作時は自動再生を止めてからセリフを選ぶ */
  function handleManualSelectIndex(index: number) {
    autoPlay.stopAutoPlay();
    goToIndex(index);
  }

  function goPrevious() {
    autoPlay.stopAutoPlay();
    stop();
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function goNext() {
    autoPlay.stopAutoPlay();
    stop();
    setCurrentIndex((index) => Math.min(lines.length - 1, index + 1));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <ConversationViewModeToggle
          mode={mode}
          isReady={isReady}
          onChange={setViewMode}
        />

        {/* 一覧表示のときだけ自動再生ボタンを表示 */}
        {mode === "overview" && (
          <ConversationAutoPlayControls
            status={autoPlay.status}
            onStart={autoPlay.startAutoPlay}
            onTogglePause={autoPlay.togglePauseResume}
            onRestart={autoPlay.restartFromBeginning}
          />
        )}
      </div>

      {mode === "step" ? (
        <ConversationStepView
          lines={lines}
          currentIndex={currentIndex}
          isFirst={isFirst}
          isLast={isLast}
          onPrevious={goPrevious}
          onNext={goNext}
        />
      ) : (
        <ConversationOverviewView
          lines={lines}
          currentIndex={currentIndex}
          isFirst={isFirst}
          isLast={isLast}
          onSelectIndex={handleManualSelectIndex}
          onPrevious={goPrevious}
          onNext={goNext}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------
// 表示モード切り替えボタン
// -------------------------------------------------------

type ConversationViewModeToggleProps = {
  mode: ConversationViewMode;
  isReady: boolean;
  onChange: (mode: ConversationViewMode) => void;
};

function ConversationViewModeToggle({
  mode,
  isReady,
  onChange,
}: ConversationViewModeToggleProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2"
      role="group"
      aria-label="会話の表示モード"
    >
      <button
        type="button"
        onClick={() => onChange("overview")}
        disabled={!isReady}
        aria-pressed={mode === "overview"}
        className={cn(
          "rounded-xl px-2 py-2.5 text-xs font-bold transition-colors sm:text-sm",
          mode === "overview"
            ? "bg-sky-500 text-white shadow-md"
            : "border border-slate-200 bg-white text-slate-600 hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-600",
          !isReady && "cursor-wait opacity-60",
        )}
      >
        📖 一覧表示
      </button>
      <button
        type="button"
        onClick={() => onChange("step")}
        disabled={!isReady}
        aria-pressed={mode === "step"}
        className={cn(
          "rounded-xl px-2 py-2.5 text-xs font-bold transition-colors sm:text-sm",
          mode === "step"
            ? "bg-sky-500 text-white shadow-md"
            : "border border-slate-200 bg-white text-slate-600 hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-600",
          !isReady && "cursor-wait opacity-60",
        )}
      >
        ▶ ステップ表示
      </button>
    </div>
  );
}

// -------------------------------------------------------
// 一覧表示：自動再生コントロール
// -------------------------------------------------------

type ConversationAutoPlayControlsProps = {
  status: AutoPlayStatus;
  onStart: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
};

function ConversationAutoPlayControls({
  status,
  onStart,
  onTogglePause,
  onRestart,
}: ConversationAutoPlayControlsProps) {
  // 全セリフ再生完了後は「最初から再生」を表示
  if (status === "finished") {
    return (
      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-xl border-2 border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-bold text-violet-800 transition-colors hover:border-violet-300 hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-900/40 dark:text-violet-100 dark:hover:bg-violet-900/60 sm:text-sm"
      >
        🔄 最初から再生
      </button>
    );
  }

  // 再生中は一時停止ボタン
  if (status === "playing") {
    return (
      <button
        type="button"
        onClick={onTogglePause}
        className="w-full rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-900 transition-colors hover:border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/60 sm:text-sm"
      >
        ⏸ 一時停止
      </button>
    );
  }

  // 一時停止中は再開ボタン
  if (status === "paused") {
    return (
      <button
        type="button"
        onClick={onTogglePause}
        className="w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100 dark:hover:bg-emerald-900/60 sm:text-sm"
      >
        ▶ 再開
      </button>
    );
  }

  // 待機中は自動再生開始ボタン
  return (
    <button
      type="button"
      onClick={onStart}
      className="w-full rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-2.5 text-xs font-bold text-sky-800 transition-colors hover:border-sky-300 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-100 dark:hover:bg-sky-900/60 sm:text-sm"
    >
      ▶ 自動再生
    </button>
  );
}

// -------------------------------------------------------
// ステップ表示：1セリフずつ「次へ」で進む（既存モード）
// -------------------------------------------------------

type ConversationStepViewProps = {
  lines: ConversationLine[];
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

function ConversationStepView({
  lines,
  currentIndex,
  isFirst,
  isLast,
  onPrevious,
  onNext,
}: ConversationStepViewProps) {
  const currentLine = lines[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        {currentIndex + 1} / {lines.length}
      </p>

      <ConversationBubble line={currentLine} />

      <ConversationNavigation
        isFirst={isFirst}
        isLast={isLast}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}

// -------------------------------------------------------
// 一覧表示：全セリフを縦に並べ、現在位置をハイライト
// -------------------------------------------------------

type ConversationOverviewViewProps = {
  lines: ConversationLine[];
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  onSelectIndex: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

function ConversationOverviewView({
  lines,
  currentIndex,
  isFirst,
  isLast,
  onSelectIndex,
  onPrevious,
  onNext,
}: ConversationOverviewViewProps) {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 現在のセリフが変わったら、スクロール領域内で見える位置へ移動する
  useEffect(() => {
    lineRefs.current[currentIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [currentIndex]);

  return (
    <div className="flex flex-col gap-4">
      {/* 進行状況バー：currentIndex + 1 と連動 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>
            現在 {currentIndex + 1} / {lines.length} セリフ
          </span>
          <span>{Math.round(((currentIndex + 1) / lines.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / lines.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 全セリフ一覧（スクロール可能） */}
      <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
        <div className="flex flex-col gap-3">
          {lines.map((line, index) => (
            <div
              key={line.id}
              ref={(element) => {
                lineRefs.current[index] = element;
              }}
              role="button"
              tabIndex={0}
              onClick={() => onSelectIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectIndex(index);
                }
              }}
              // 手動選択時は onSelectIndex 内で自動再生が停止される
              aria-current={index === currentIndex ? "true" : undefined}
              aria-label={`${line.speaker}のセリフ: ${line.chinese}`}
              className={cn(
                "cursor-pointer rounded-xl p-1 transition-colors",
                index === currentIndex &&
                  "bg-sky-100/80 ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-50 dark:bg-sky-900/30 dark:ring-sky-400 dark:ring-offset-slate-900",
              )}
            >
              <ConversationBubble
                line={line}
                isLearnerRightAlign
                onFocus={() => onSelectIndex(index)}
              />
            </div>
          ))}
        </div>
      </div>

      <ConversationNavigation
        isFirst={isFirst}
        isLast={isLast}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}

// -------------------------------------------------------
// 共通：前へ / 次へナビゲーション
// -------------------------------------------------------

type ConversationNavigationProps = {
  isFirst: boolean;
  isLast: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

function ConversationNavigation({
  isFirst,
  isLast,
  onPrevious,
  onNext,
}: ConversationNavigationProps) {
  return (
    <>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          aria-label="前のセリフ"
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white transition-colors dark:border-slate-600 dark:bg-slate-800",
            isFirst
              ? "cursor-not-allowed opacity-40"
              : "hover:border-sky-400 hover:bg-sky-50 dark:hover:border-sky-500 dark:hover:bg-slate-700",
          )}
        >
          <ChevronLeft className="h-6 w-6 text-slate-700 dark:text-slate-200" />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          aria-label="次のセリフ"
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white transition-colors dark:border-slate-600 dark:bg-slate-800",
            isLast
              ? "cursor-not-allowed opacity-40"
              : "hover:border-sky-400 hover:bg-sky-50 dark:hover:border-sky-500 dark:hover:bg-slate-700",
          )}
        >
          <ChevronRight className="h-6 w-6 text-slate-700 dark:text-slate-200" />
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        className={cn(
          "w-full rounded-xl py-3 text-sm font-bold transition-colors",
          isLast
            ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
            : "bg-emerald-500 text-white hover:bg-emerald-600",
        )}
      >
        次へ
      </button>
    </>
  );
}

// -------------------------------------------------------
// 共通：1セリフ分の吹き出し
// -------------------------------------------------------

type ConversationBubbleProps = {
  line: ConversationLine;
  /** 一覧表示用：健（学習者）の吹き出しを右寄せにする */
  isLearnerRightAlign?: boolean;
  /** 一覧表示用：このセリフが選択されたときに呼ばれる */
  onFocus?: () => void;
};

function ConversationAudioButton({
  src,
  onBeforePlay,
}: {
  src: string;
  onBeforePlay?: () => void;
}) {
  const { play, stop, isPlaying } = useAudio();
  const playing = isPlaying(src);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // 親の行クリックと二重に発火しないよう伝播を止める
    event.stopPropagation();

    if (playing) {
      stop();
      return;
    }

    // 音声再生前に現在セリフとして選択する
    onBeforePlay?.();
    play(src);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={playing ? "音声を停止" : "音声を再生"}
      className={cn(
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

function ConversationBubble({
  line,
  isLearnerRightAlign = false,
  onFocus,
}: ConversationBubbleProps) {
  const isLearner = line.is_learner;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex w-full items-start gap-3">
      <ConversationAudioButton src={line.audio} onBeforePlay={onFocus} />

      <div
        className={cn(
          "rounded-2xl border-2 px-4 py-3",
          isLearner
            ? "border-blue-300 bg-blue-100 dark:border-blue-600 dark:bg-blue-900/50"
            : "border-slate-200 bg-slate-100 dark:border-gray-400 dark:bg-slate-600",
          isLearnerRightAlign && isLearner
            ? "ml-auto max-w-[calc(100%-3.5rem)] text-right"
            : "min-w-0 flex-1",
        )}
      >
        <p
          className={cn(
            "mb-1 text-xs font-bold",
            isLearner ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-gray-100",
          )}
        >
          {line.speaker}
        </p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFocus?.();
            setExpanded((value) => !value);
          }}
          aria-expanded={expanded}
          aria-label={
            expanded ? "ピンインと日本語訳を閉じる" : "ピンインと日本語訳を表示"
          }
          className={cn(
            "w-full font-sc text-lg font-bold leading-relaxed",
            "rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            isLearnerRightAlign && isLearner ? "text-right" : "text-left",
            isLearner
              ? "focus-visible:outline-blue-400 dark:text-slate-100"
              : "focus-visible:outline-slate-400 dark:text-white",
          )}
        >
          {line.chinese}
        </button>

        {expanded && (
          <div className="mt-2 border-t border-black/10 pt-2 dark:border-white/10">
            <p
              className={cn(
                "text-xs leading-relaxed text-slate-500 dark:text-slate-400",
                isLearnerRightAlign && isLearner && "text-right",
              )}
            >
              {line.pinyin}
            </p>
            <p
              className={cn(
                "mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300",
                isLearnerRightAlign && isLearner && "text-right",
              )}
            >
              {line.japanese}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
