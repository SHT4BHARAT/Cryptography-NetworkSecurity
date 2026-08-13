// frontend/lib/utils/money.ts
// Centralized currency formatting so amounts are never hardcoded with a "$".

export type MoneyOptions = {
  currency?: string;
  locale?: string;
  /** When true, prepend a +/- sign based on the amount's sign. */
  sign?: boolean;
};

export function formatMoney(amount: number, options: MoneyOptions = {}): string {
  const { currency = "USD", locale = "en-US", sign = false } = options;
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(Math.abs(amount));
  if (!sign) return formatted;
  return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

export function formatMoneySigned(amount: number, options: Omit<MoneyOptions, "sign"> = {}): string {
  return formatMoney(amount, { ...options, sign: true });
}