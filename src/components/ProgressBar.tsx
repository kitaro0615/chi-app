type ProgressBarProps = {
  completed: number;
  total: number;
  label?: string;
};

export function ProgressBar({
  completed,
  total,
  label = "言語習得システム",
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full rounded-xl border-2 border-sky-200 bg-slate-900 p-4 text-white shadow-inner dark:border-sky-900">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold tracking-wide text-sky-300">{label}</span>
        <span className="text-sky-200">
          {completed} / {total} 課（{percentage}%）
        </span>
      </div>
      <div
        className="h-4 overflow-hidden rounded-full bg-slate-700"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`学習進捗 ${completed}課完了`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
