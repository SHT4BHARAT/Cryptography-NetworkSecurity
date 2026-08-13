export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-[3px] border border-dashed border-line p-8 text-center text-ledger">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm">{hint}</p>
    </div>
  );
}
