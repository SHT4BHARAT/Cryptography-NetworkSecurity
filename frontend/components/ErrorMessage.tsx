export function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-[3px] border border-debit/30 bg-debit/10 p-3 text-sm text-debit"
    >
      {message}
    </div>
  );
}
