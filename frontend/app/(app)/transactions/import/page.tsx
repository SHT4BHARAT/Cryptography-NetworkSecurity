// frontend/app/(app)/transactions/import/page.tsx
"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";

type ImportResult = {
  imported: number;
  skippedDuplicates: number;
  errors: { line: number; reason: string }[];
};

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const onUpload = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/transactions/import", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setResult(data as ImportResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/transactions" className="text-sm text-blue-600 hover:underline">
          ← Back to transactions
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-neutral-900">Import CSV</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Upload a bank statement CSV. Expected columns: date, description, amount.
          Dates accept ISO (2024-03-01), DMY (01-03-2024) and slash (01/03/2024)
          formats. Amounts tolerate $, commas and spaces.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setResult(null);
          }}
          className="mb-4"
        />
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-neutral-600">
            {file ? file.name : "No file selected"}
          </p>
          <button
            onClick={onUpload}
            disabled={busy || !file}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Importing…" : "Upload & categorize"}
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {result && (
        <div className="space-y-4 rounded-lg border bg-white p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded border border-neutral-200 p-3">
              <p className="text-xs text-neutral-500">Imported</p>
              <p className="mt-1 text-lg font-semibold text-green-600">{result.imported}</p>
            </div>
            <div className="rounded border border-neutral-200 p-3">
              <p className="text-xs text-neutral-500">Skipped duplicates</p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {result.skippedDuplicates}
              </p>
            </div>
            <div className="rounded border border-neutral-200 p-3">
              <p className="text-xs text-neutral-500">Rows with errors</p>
              <p className="mt-1 text-lg font-semibold text-red-600">{result.errors.length}</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-neutral-900">Skipped rows</h2>
              <ul className="space-y-1 text-sm text-neutral-600">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Line {e.line} — {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/transactions" className="text-sm text-blue-600 hover:underline">
            View transactions →
          </Link>
        </div>
      )}

      {!result && !error && (
        <EmptyState
          title="CSV import"
          hint="Pick a CSV file above to get started. Valid rows import even when others fail."
        />
      )}
    </div>
  );
}