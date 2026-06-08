"use client";

import { useState } from "react";
import type { Lesson } from "@/types/lesson";
import { cn } from "@/lib/cn";
import { ConversationPanel } from "@/components/ConversationPanel";
import { MangaPanelGrid } from "@/components/MangaPanel";
import { ShadowingPlayer } from "@/components/ShadowingPlayer";
import { StudyNotes } from "@/components/StudyNotes";

type TabId = "story" | "shadowing" | "conversation" | "notes";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "story", label: "ストーリー", icon: "📖" },
  { id: "shadowing", label: "シャドーイング", icon: "🎙" },
  { id: "conversation", label: "会話練習", icon: "💬" },
  { id: "notes", label: "学習メモ", icon: "📝" },
];

type LessonDetailClientProps = {
  lesson: Lesson;
};

export function LessonDetailClient({ lesson }: LessonDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("story");

  return (
    <div className="flex flex-col gap-4">
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="tablist"
        aria-label="レッスンセクション"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-xl px-2 py-2.5 text-xs font-bold transition-colors sm:text-sm",
              activeTab === tab.id
                ? "bg-sky-500 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-600 hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-600",
            )}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="min-h-[200px]">
        {activeTab === "story" && (
          <div className="flex flex-col gap-6">
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-2 text-sm font-bold text-sky-700 dark:text-sky-300">場面描写</h2>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {lesson.scene_description}
              </p>
            </section>
            <MangaPanelGrid panels={lesson.manga_panels} />
            <section className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4 dark:border-violet-500 dark:bg-slate-700">
              <h2 className="mb-2 text-sm font-bold text-violet-700 dark:text-violet-300">健の独白</h2>
              <p className="text-sm leading-relaxed text-violet-900 dark:text-slate-100">
                {lesson.ken_monologue}
              </p>
            </section>
          </div>
        )}

        {activeTab === "shadowing" && (
          <ShadowingPlayer items={lesson.shadowing_base} />
        )}

        {activeTab === "conversation" && (
          <ConversationPanel lines={lesson.conversation} />
        )}

        {activeTab === "notes" && <StudyNotes notes={lesson.study_notes} />}
      </div>
    </div>
  );
}
