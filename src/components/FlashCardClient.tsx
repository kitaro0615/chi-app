"use client";

import { Pause, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ShadowingItem } from "@/types/lesson";
import { useAudio } from "@/hooks/useAudio";
import { useVocabulary } from "@/hooks/useVocabulary";

type FlashCardClientProps = {
  lessonId: number;
  items: ShadowingItem[]; // シャドーイングデータ（単語カードの素材）
};

export function FlashCardClient({ lessonId, items }: FlashCardClientProps) {
  // 単語の「覚えた」進捗を管理するフック
  const { masteredIds, markMastered, resetAll, isReady } =
    useVocabulary(lessonId);

  // 音声再生フック
  const { play, stop, isPlaying } = useAudio();

  // セッション内で表示するカードの一覧（セッション開始時にスナップショットを固定）
  const [sessionCards, setSessionCards] = useState<ShadowingItem[]>([]);

  // セッションの初期化が完了したかどうか（2回目以降の実行を防ぐためのフラグ）
  const initializedRef = useRef(false);

  // 現在表示中のカードのインデックス
  const [currentIndex, setCurrentIndex] = useState(0);

  // カードが裏返っているかどうか（false = 表面：中国語、true = 裏面：ピンイン・日本語）
  const [isFlipped, setIsFlipped] = useState(false);

  // セッションが全カード終了したかどうか
  const [isDone, setIsDone] = useState(false);

  // localStorage の読み込みが完了したら、未習得カードをセッションに設定する
  useEffect(() => {
    if (!isReady || initializedRef.current) return;
    initializedRef.current = true;
    // 「覚えた」カードを除いた未習得カードのみを今回のセッションに使う
    const pending = items.filter((item) => !masteredIds.includes(item.id));
    setSessionCards(pending);
  }, [isReady, items, masteredIds]);

  // 現在表示中のカード
  const currentCard = sessionCards[currentIndex];

  // カードをタップ/クリックして表裏を切り替える
  function handleFlip() {
    stop(); // フリップ時は音声を止める
    setIsFlipped((v) => !v);
  }

  // 次のカードへ進む（内部ヘルパー）
  function advance() {
    setIsFlipped(false);
    stop();
    if (currentIndex >= sessionCards.length - 1) {
      // 最後のカードだったのでセッション完了
      setIsDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // 「覚えた」ボタンが押されたとき
  function handleMastered() {
    if (!currentCard) return;
    markMastered(currentCard.id); // localStorage に保存
    advance();
  }

  // 「もう一度」ボタンが押されたとき（覚えていないので次へ進むだけ）
  function handleAgain() {
    advance();
  }

  // 「最初からやり直す」ボタンが押されたとき
  function handleReset() {
    stop();
    resetAll(); // localStorage のこのレッスンの進捗をクリア
    setSessionCards([...items]); // 全カードを再セット
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsDone(false);
  }

  // localStorage 読み込み中はローディング表示
  if (!isReady || !initializedRef.current) {
    return (
      <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        読み込み中…
      </p>
    );
  }

  // セッション開始時点で全カードが習得済みの場合（スキップ）
  if (sessionCards.length === 0 && !isDone) {
    return (
      <CompletionScreen
        masteredCount={masteredIds.length}
        totalCount={items.length}
        message="このレッスンの単語はすべて覚えました！"
        onReset={handleReset}
      />
    );
  }

  // セッション内の全カードを見終わった場合
  if (isDone) {
    return (
      <CompletionScreen
        masteredCount={masteredIds.length}
        totalCount={items.length}
        message="セッション完了！おめでとうございます！"
        onReset={handleReset}
      />
    );
  }

  // カードが存在しない場合（念のため）
  if (!currentCard) return null;

  const playing = isPlaying(currentCard.audio);
  // 残り枚数（現在のカード含む）
  const remaining = sessionCards.length - currentIndex;

  return (
    <div className="flex flex-col gap-6">
      {/* 進捗バー */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>残り {remaining} 枚</span>
          <span>覚えた {masteredIds.length} / {items.length} 語</span>
        </div>
        {/* プログレスバー本体 */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{
              width: `${items.length > 0 ? (masteredIds.length / items.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* フラッシュカード本体（タップで表裏切り替え） */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleFlip}
        onKeyDown={(e) => {
          // キーボードでも操作できるようにする
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
        aria-label={isFlipped ? "カードを閉じる（クリックで中国語のみに戻す）" : "カードを開く（クリックでピンイン・意味を表示）"}
        className="min-h-48 cursor-pointer rounded-2xl border-2 border-sky-200 bg-white px-6 py-10 text-center shadow-sm transition-colors hover:border-sky-300 dark:border-sky-800 dark:bg-slate-800 dark:hover:border-sky-700"
      >
        {!isFlipped ? (
          /* 表面：中国語テキストのみ */
          <div className="flex flex-col items-center gap-3">
            <p className="font-sc text-4xl font-bold leading-relaxed text-slate-900 dark:text-slate-100">
              {currentCard.chinese}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              タップして答えを確認
            </p>
          </div>
        ) : (
          /* 裏面：ピンイン・日本語・音声ボタン */
          <div className="flex flex-col items-center gap-4">
            <p className="font-sc text-4xl font-bold leading-relaxed text-slate-900 dark:text-slate-100">
              {currentCard.chinese}
            </p>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              {currentCard.pinyin}
            </p>
            <p className="text-base text-slate-500 dark:text-slate-400">
              {currentCard.japanese}
            </p>
            {/* 音声再生ボタン（クリックでカードのフリップを防ぐため stopPropagation） */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (playing) {
                  stop();
                } else {
                  play(currentCard.audio);
                }
              }}
              aria-label={playing ? "音声を停止" : "音声を再生"}
              className="flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50"
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              {playing ? "停止" : "音声を再生"}
            </button>
          </div>
        )}
      </div>

      {/* 判定ボタン：裏面を見ているときだけ表示 */}
      {isFlipped ? (
        <div className="grid grid-cols-2 gap-3">
          {/* 「もう一度」：覚えていないので次の機会に再表示 */}
          <button
            type="button"
            onClick={handleAgain}
            className="rounded-xl border-2 border-orange-200 bg-orange-50 py-3 text-sm font-bold text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
          >
            もう一度
          </button>
          {/* 「覚えた」：習得済みとして記録し次のカードへ */}
          <button
            type="button"
            onClick={handleMastered}
            className="rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
          >
            覚えた ✓
          </button>
        </div>
      ) : (
        /* 表面表示中は「最初からやり直す」を小さく表示 */
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-3 w-3" />
          最初からやり直す
        </button>
      )}
    </div>
  );
}

// -------------------------------------------------------
// セッション完了・全習得済み時に表示する共通コンポーネント
// -------------------------------------------------------

type CompletionScreenProps = {
  masteredCount: number;
  totalCount: number;
  message: string;
  onReset: () => void;
};

function CompletionScreen({
  masteredCount,
  totalCount,
  message,
  onReset,
}: CompletionScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <p className="text-6xl">🎉</p>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {message}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        覚えた単語：{masteredCount} / {totalCount} 語
      </p>
      {/* 「最初からやり直す」で全カードをリセットして再挑戦 */}
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <RotateCcw className="h-4 w-4" />
        最初からやり直す
      </button>
    </div>
  );
}
