import * as SQLite from 'expo-sqlite';
import { Transaction } from '../types';
import { SYNC_QUEUE_TABLE, TRANSACTIONS_TABLE } from './schema';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('expenses.db');
  }
  return databasePromise;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(TRANSACTIONS_TABLE + SYNC_QUEUE_TABLE);
}

export async function addTransaction(
  transaction: Omit<Transaction, 'is_synced'>,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO transactions (id, amount, category, type, note, date, is_synced)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [
      transaction.id,
      transaction.amount,
      transaction.category,
      transaction.type,
      transaction.note,
      transaction.date,
    ],
  );
}

export async function getTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC',
  );
  return rows;
}

export async function getUnsyncedTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE is_synced = 0',
  );
}

export async function markAsSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDatabase();
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE transactions SET is_synced = 1 WHERE id IN (${placeholders})`,
    ids,
  );
}
