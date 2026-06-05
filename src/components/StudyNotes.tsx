type StudyNotesProps = {
  notes: string[];
};

export function StudyNotes({ notes }: StudyNotesProps) {
  return (
    <ol className="flex flex-col gap-3">
      {notes.map((note, index) => {
        const isVocabulary = index === notes.length - 1;

        return (
          <li
            key={`${index}-${note.slice(0, 20)}`}
            className={
              isVocabulary
                ? "rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
                : "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700"
            }
          >
            <span className="mr-2 font-bold text-sky-600">{index + 1}.</span>
            {note}
          </li>
        );
      })}
    </ol>
  );
}
