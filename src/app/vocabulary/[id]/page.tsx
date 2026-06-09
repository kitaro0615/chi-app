import Link from "next/link";
import { notFound } from "next/navigation";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { FlashCardClient } from "@/components/FlashCardClient";
import { getLesson, getLessonIds, isValidLessonId } from "@/lib/lessonLoader";

type VocabularyLessonPageProps = {
  params: Promise<{ id: string }>;
};

// ビルド時に全40課分の静的パスを生成する（SSG）
export function generateStaticParams() {
  return getLessonIds().map((id) => ({ id: String(id) }));
}

// フラッシュカードページ：1課分の単語を1枚ずつ表示して練習できる
export default async function VocabularyLessonPage({
  params,
}: VocabularyLessonPageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  // 無効なIDの場合は404ページを返す
  if (!isValidLessonId(id)) {
    notFound();
  }

  const lesson = await getLesson(id);
  if (!lesson) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        {/* ヘッダー行：単語帳一覧へ戻るリンク + ダークモードトグル */}
        <div className="flex items-center justify-between">
          <Link
            href="/vocabulary"
            className="text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            ← 単語帳一覧
          </Link>
          <DarkModeToggle />
        </div>

        {/* 課番号バッジ */}
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
            第{lesson.id}課
          </span>
        </div>

        {/* レッスンタイトル・テーマ */}
        <h1 className="font-sc text-2xl font-bold text-gray-900 dark:text-white">
          {lesson.title}
        </h1>
        <p className="text-sm text-gray-800 dark:text-gray-100">
          {lesson.theme}
        </p>
      </header>

      {/*
       * フラッシュカードの本体はクライアントコンポーネント。
       * localStorage の読み書きや音声再生などのブラウザ操作が必要なため。
       */}
      <FlashCardClient lessonId={lesson.id} items={lesson.shadowing_base} />
    </div>
  );
}
