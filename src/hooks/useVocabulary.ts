"use client";

import { useCallback, useEffect, useState } from "react";

// localStorage に保存するデータの型
type VocabProgress = {
  masteredIds: string[]; // 「覚えた」と判定した単語のIDリスト
};

// レッスンIDごとに別々のキーで保存する
function getStorageKey(lessonId: number): string {
  return `chi-app-vocab-${lessonId}`;
}

/**
 * 単語の「覚えた」進捗を localStorage で管理するカスタムフック
 *
 * @param lessonId - 対象のレッスンID（1〜40）
 */
export function useVocabulary(lessonId: number) {
  // 「覚えた」と判定した単語IDの配列
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  // localStorage の読み込みが完了したかどうか
  const [isReady, setIsReady] = useState(false);

  // マウント時に localStorage から進捗を読み込む
  useEffect(() => {
    try {
      const raw = localStorage.getItem(getStorageKey(lessonId));
      if (raw) {
        const data = JSON.parse(raw) as VocabProgress;
        setMasteredIds(data.masteredIds ?? []);
      }
    } catch {
      // localStorage が読めない環境では空で開始する
    }
    setIsReady(true);
  }, [lessonId]);

  // 進捗を localStorage に書き込むヘルパー関数
  const persist = useCallback(
    (ids: string[]) => {
      const data: VocabProgress = { masteredIds: ids };
      localStorage.setItem(getStorageKey(lessonId), JSON.stringify(data));
    },
    [lessonId],
  );

  /**
   * 指定した単語IDを「覚えた」に登録する
   * すでに登録済みの場合は何もしない
   */
  const markMastered = useCallback(
    (id: string) => {
      setMasteredIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  /**
   * このレッスンの進捗をすべてリセットする
   * 「最初からやり直す」ボタンから呼ばれる
   */
  const resetAll = useCallback(() => {
    localStorage.removeItem(getStorageKey(lessonId));
    setMasteredIds([]);
  }, [lessonId]);

  return { masteredIds, markMastered, resetAll, isReady };
}
