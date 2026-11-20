import NetInfo from '@react-native-community/netinfo';
import {
  getUnsyncedTransactions,
  markAsSynced,
} from '../db/database';

const SYNC_ENDPOINT = 'https://api.example.com/sync';
let unsubscribe: (() => void) | null = null;
let syncInProgress = false;

export async function syncTransactions(): Promise<boolean> {
  if (syncInProgress) return false;

  const state = await NetInfo.fetch();
  if (!state.isConnected || !state.isInternetReachable) return false;

  syncInProgress = true;
  try {
    const transactions = await getUnsyncedTransactions();
    if (transactions.length === 0) return true;

    const response = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    });

    if (response.status !== 200) return false;

    await markAsSynced(transactions.map((transaction) => transaction.id));
    return true;
  } catch {
    return false;
  } finally {
    syncInProgress = false;
  }
}

export function startSyncManager(): () => void {
  if (unsubscribe) return unsubscribe;

  unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      void syncTransactions();
    }
  });

  void syncTransactions();
  return unsubscribe;
}
