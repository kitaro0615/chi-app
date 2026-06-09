"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationLine } from "@/types/lesson";
import { subscribeAudioEnded, useAudio } from "@/hooks/useAudio";

/** セリフとセリフの間に空ける待ち時間（ミリ秒） */
const GAP_BETWEEN_LINES_MS = 500;

export type AutoPlayStatus = "idle" | "playing" | "paused" | "finished";

type UseConversationAutoPlayOptions = {
  lines: ConversationLine[];
  setCurrentIndex: (index: number) => void;
};

/**
 * 一覧表示モード用：会話音声を先頭から順番に自動再生するフック
 */
export function useConversationAutoPlay({
  lines,
  setCurrentIndex,
}: UseConversationAutoPlayOptions) {
  const { play, stop, pause, resume } = useAudio();
  const [status, setStatus] = useState<AutoPlayStatus>("idle");

  // 最新の状態をイベントハンドラから参照するための ref
  const statusRef = useRef<AutoPlayStatus>("idle");
  const playingIndexRef = useRef(0);
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncStatus = useCallback((next: AutoPlayStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  /** セリフ間の待ちタイマーを解除する */
  const clearGapTimer = useCallback(() => {
    if (gapTimerRef.current) {
      clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
  }, []);

  /** 自動再生を完全に停止する */
  const stopAutoPlay = useCallback(() => {
    clearGapTimer();
    stop();
    syncStatus("idle");
  }, [clearGapTimer, stop, syncStatus]);

  /** 指定インデックスのセリフ音声を再生し、currentIndex も更新する */
  const playAtIndex = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(lines.length - 1, index));
      playingIndexRef.current = safeIndex;
      setCurrentIndex(safeIndex);
      play(lines[safeIndex].audio);
    },
    [lines, play, setCurrentIndex],
  );

  /** 0.5 秒待ってから次のセリフへ進む */
  const scheduleNextLine = useCallback(() => {
    clearGapTimer();

    gapTimerRef.current = setTimeout(() => {
      if (statusRef.current !== "playing") {
        return;
      }

      const nextIndex = playingIndexRef.current + 1;
      if (nextIndex >= lines.length) {
        syncStatus("finished");
        return;
      }

      playAtIndex(nextIndex);
    }, GAP_BETWEEN_LINES_MS);
  }, [clearGapTimer, lines.length, playAtIndex, syncStatus]);

  // 音声が終わったら次のセリフへ（最後のセリフなら完了状態へ）
  useEffect(() => {
    const unsubscribe = subscribeAudioEnded(() => {
      if (statusRef.current !== "playing") {
        return;
      }

      if (playingIndexRef.current >= lines.length - 1) {
        syncStatus("finished");
        return;
      }

      scheduleNextLine();
    });

    return unsubscribe;
  }, [lines.length, scheduleNextLine, syncStatus]);

  // アンマウント時にタイマーと音声を必ず止める
  useEffect(() => {
    return () => {
      clearGapTimer();
      stop();
    };
  }, [clearGapTimer, stop]);

  /** ▶ 自動再生：先頭のセリフから順番に再生開始 */
  const startAutoPlay = useCallback(() => {
    if (lines.length === 0) {
      return;
    }

    clearGapTimer();
    stop();
    syncStatus("playing");
    playAtIndex(0);
  }, [clearGapTimer, lines.length, playAtIndex, stop, syncStatus]);

  /** 最初から再生：完了後に先頭からやり直す */
  const restartFromBeginning = useCallback(() => {
    if (lines.length === 0) {
      return;
    }

    clearGapTimer();
    stop();
    syncStatus("playing");
    playAtIndex(0);
  }, [clearGapTimer, lines.length, playAtIndex, stop, syncStatus]);

  /** 再生中 ⇔ 一時停止 を切り替える */
  const togglePauseResume = useCallback(() => {
    if (statusRef.current === "playing") {
      clearGapTimer();
      pause();
      syncStatus("paused");
      return;
    }

    if (statusRef.current === "paused") {
      syncStatus("playing");
      resume();
    }
  }, [clearGapTimer, pause, resume, syncStatus]);

  return {
    status,
    startAutoPlay,
    restartFromBeginning,
    togglePauseResume,
    stopAutoPlay,
  };
}
