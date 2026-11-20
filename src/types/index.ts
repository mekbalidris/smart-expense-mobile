export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: TransactionType;
  note: string;
  date: string;
  is_synced: number;
}

export interface CategoryTotal {
  category: string;
  amount: number;
  color: string;
}
