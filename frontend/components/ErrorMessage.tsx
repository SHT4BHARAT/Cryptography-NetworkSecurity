// frontend/components/ErrorMessage.tsx
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      {message}
    </div>
  );
}