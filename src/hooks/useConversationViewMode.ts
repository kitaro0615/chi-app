"use client";

import { useCallback, useEffect, useState } from "react";

/** 会話練習タブの表示モード */
export type ConversationViewMode = "step" | "overview";

const STORAGE_KEY = "chi-app-conversation-view-mode";

function isConversationViewMode(value: string): value is ConversationViewMode {
  return value === "step" || value === "overview";
}

/**
 * 会話練習の表示モード（ステップ / 一覧）を localStorage で保持するフック
 */
export function useConversationViewMode() {
  const [mode, setMode] = useState<ConversationViewMode>("step");
  const [isReady, setIsReady] = useState(false);

  // マウント時に前回の選択を復元する
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isConversationViewMode(stored)) {
        setMode(stored);
      }
    } catch {
      // localStorage が使えない環境ではデフォルト（ステップ表示）のまま
    }

    setIsReady(true);
  }, []);

  const setViewMode = useCallback((next: ConversationViewMode) => {
    setMode(next);

    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存失敗時も画面上の切り替えは反映済みなので握りつぶす
    }
  }, []);

  return { mode, setViewMode, isReady };
}
