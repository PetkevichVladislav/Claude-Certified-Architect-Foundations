import type { QuizQuestion } from './questions'

export interface BankIndex {
  id: string;
  name: string;
  icon: string;
  description: string;
  file: string;
  count: number;
  isDefault: boolean;
}

export interface BankData {
  id: string;
  name: string;
  description: string;
  icon: string;
  questions: QuizQuestion[];
}

const base = import.meta.env.BASE_URL;

let indexCache: BankIndex[] | null = null;
const bankCache = new Map<string, BankData>();

export async function loadBankIndex(): Promise<BankIndex[]> {
  if (indexCache) return indexCache;
  const res = await fetch(`${base}banks/index.json`);
  indexCache = await res.json();
  return indexCache!;
}

export async function loadBank(bankId: string): Promise<BankData> {
  const cached = bankCache.get(bankId);
  if (cached) return cached;
  const index = await loadBankIndex();
  const entry = index.find(b => b.id === bankId);
  if (!entry) throw new Error(`Bank not found: ${bankId}`);
  const res = await fetch(`${base}banks/${entry.file}`);
  const data: BankData = await res.json();
  bankCache.set(bankId, data);
  return data;
}
