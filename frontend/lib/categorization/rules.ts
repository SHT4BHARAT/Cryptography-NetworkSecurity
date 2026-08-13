// frontend/lib/categorization/rules.ts
export const CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Rent",
  "Shopping",
  "Subscriptions",
  "Travel",
  "Bills & Utilities",
  "Entertainment",
  "Transport",
  "Health",
  "Income",
  "Transfers",
  "Uncategorized",
] as const;

export type Category = (typeof CATEGORIES)[number];

type Rule = { keywords: string[]; category: Category };

const OUTPUT_CATEGORY: Record<string, Category> = {
  "Food & Dining": "Food & Dining",
  Groceries: "Groceries",
  Rent: "Rent",
  Shopping: "Shopping",
  Subscriptions: "Subscriptions",
  Subscription: "Subscriptions",
  Travel: "Travel",
  "Bills & Utilities": "Bills & Utilities",
  Bills: "Bills & Utilities",
  Utilities: "Bills & Utilities",
  Entertainment: "Entertainment",
  Transport: "Transport",
  Health: "Health",
  Income: "Income",
  Transfers: "Transfers",
};

const RULES: Rule[] = [
  { keywords: ["salary", "payroll", "wages", "deposit acct"], category: "Income" },
  {
    keywords: ["zomato", "swiggy", "uber eats", "doordash", "restaurant", "cafe", "starbucks", "pizza"],
    category: "Food & Dining",
  },
  {
    keywords: ["walmart", "target", "whole foods", "trader joe", "grocery", "publix", "safeway"],
    category: "Groceries",
  },
  { keywords: ["rent ", "lease", "property mgmt"], category: "Rent" },
  {
    keywords: ["amazon", "flipkart", "myntra", "nike", "zara", "hm ", "h&m", "mall"],
    category: "Shopping",
  },
  {
    keywords: ["netflix", "spotify", "prime video", "hulu", "disney+", "hbo", "youtube premium", "dropbox"],
    category: "Subscriptions",
  },
  {
    keywords: ["airline", "air india", "booking.com", "airbnb", "hotel", "uber", "ola", "lyft", "irctc", "fuel"],
    category: "Travel",
  },
  {
    keywords: ["electricity", "water bill", "gas bill", "internet", "broadband", "jio", "airtel", "recharge", "eb bill"],
    category: "Bills & Utilities",
  },
  {
    keywords: ["ticket", "cinema", "movie", "game", "steam", "concert", "bookmyshow"],
    category: "Entertainment",
  },
  {
    keywords: ["metro", "bus", "train", "parking", "taxi", "petrol", "diesel"],
    category: "Transport",
  },
  {
    keywords: ["pharmacy", "hospital", "clinic", "doctor", "dentist", "medical", "apollo"],
    category: "Health",
  },
  { keywords: ["transfer", "upi ref", "imps", "neft", "wallet"], category: "Transfers" },
];

export function categorizeByRules(text: string, amount: number): Category | null {
  if (amount > 0) return "Income";
  const haystack = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => haystack.includes(k))) return rule.category;
  }
  return null;
}

function normalizeLabel(s: string): string {
  return s.toLowerCase().replace(/&|and|[-.\s_]/g, "");
}

export function mapLlmCategory(label: string): Category {
  const normalized = normalizeLabel(String(label ?? ""));
  if (!normalized) return "Uncategorized";
  for (const key of Object.keys(OUTPUT_CATEGORY)) {
    if (
      normalized.includes(normalizeLabel(key)) ||
      normalizeLabel(key).includes(normalized)
    ) {
      return OUTPUT_CATEGORY[key];
    }
  }
  return "Uncategorized";
}