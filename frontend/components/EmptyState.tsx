// frontend/components/EmptyState.tsx
export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
      <p className="font-medium text-neutral-700">{title}</p>
      <p className="mt-1 text-sm">{hint}</p>
    </div>
  );
}