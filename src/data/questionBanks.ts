import type { QuizQuestion } from './questions'

export interface BankIndex {
  id: string;
  name: string;
  icon: string;
  description: string;
  disclaimer: string;
  sourceUrl: string;
  file: string;
  count: number;
  isDefault: boolean;
}

export interface BankData {
  id: string;
  name: string;
  description: string;
  disclaimer: string;
  sourceUrl: string;
  icon: string;
  questions: QuizQuestion[];
}

const ALL_BANK_ID = '__all__';
const rawBase = import.meta.env.BASE_URL ?? '/';
const base = new URL(rawBase.endsWith('/') ? rawBase : `${rawBase}/`, typeof window !== 'undefined' ? window.location.href : 'http://localhost/').toString();

let indexCache: BankIndex[] | null = null;
const bankCache = new Map<string, BankData>();

export async function loadBankIndex(): Promise<BankIndex[]> {
  if (indexCache) return indexCache;
  const res = await fetch(new URL('banks/index.json', base).toString());
  if (!res.ok) throw new Error(`Failed to load bank index: ${res.status} ${res.statusText}`);
  const banks: BankIndex[] = await res.json();

  const totalCount = banks.reduce((sum, b) => sum + b.count, 0);
  banks.push({
    id: ALL_BANK_ID,
    name: 'All Questions',
    icon: '\u{1F4DA}',
    description: `All ${totalCount} questions merged from every bank (deduplicated)`,
    disclaimer: 'Aggregated from multiple sources. Used for educational preparation purposes only.',
    sourceUrl: '',
    file: '',
    count: totalCount,
    isDefault: false,
  });

  indexCache = banks;
  return indexCache;
}

function dedup(questions: QuizQuestion[]): QuizQuestion[] {
  const seen = new Set<string>();
  return questions.filter(q => {
    const key = q.question.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function loadBank(bankId: string): Promise<BankData> {
  const cached = bankCache.get(bankId);
  if (cached) return cached;

  if (bankId === ALL_BANK_ID) {
    const index = await loadBankIndex();
    const realBanks = index.filter(b => b.id !== ALL_BANK_ID);
    const allQ: QuizQuestion[] = [];
    for (const entry of realBanks) {
      const bank = await loadBank(entry.id);
      allQ.push(...bank.questions);
    }
    const unique = dedup(allQ);
    const data: BankData = {
      id: ALL_BANK_ID,
      name: 'All Questions',
      description: `${unique.length} unique questions from all sources`,
      disclaimer: 'Aggregated from multiple sources. Used for educational preparation purposes only.',
      sourceUrl: '',
      icon: '\u{1F4DA}',
      questions: unique,
    };
    bankCache.set(bankId, data);
    return data;
  }

  const index = await loadBankIndex();
  const entry = index.find(b => b.id === bankId);
  if (!entry) throw new Error(`Bank not found: ${bankId}`);
  const res = await fetch(new URL(`banks/${entry.file}`, base).toString());
  if (!res.ok) throw new Error(`Failed to load bank data: ${res.status} ${res.statusText}`);
  const data: BankData = await res.json();
  bankCache.set(bankId, data);
  return data;
}
