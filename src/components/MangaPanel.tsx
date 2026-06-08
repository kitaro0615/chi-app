import Image from "next/image";
import type { MangaPanel as MangaPanelType } from "@/types/lesson";
import { resolvePanelImageSrc } from "@/lib/imageUtils";

type MangaPanelProps = {
  panel: MangaPanelType;
};

export function MangaPanel({ panel }: MangaPanelProps) {
  const imageSrc = resolvePanelImageSrc(panel.image);

  return (
    <figure className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-700">
        <Image
          src={imageSrc}
          alt={panel.caption ?? `コマ ${panel.panel_id}`}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
        />
      </div>
      {panel.caption && (
        <figcaption className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:text-slate-300">
          {panel.caption}
        </figcaption>
      )}
    </figure>
  );
}

type MangaPanelGridProps = {
  panels: MangaPanelType[];
};

export function MangaPanelGrid({ panels }: MangaPanelGridProps) {
  return (
    <div className="flex flex-col gap-4">
      {panels.map((panel) => (
        <MangaPanel key={panel.panel_id} panel={panel} />
      ))}
    </div>
  );
}
