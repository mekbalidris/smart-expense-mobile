import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, initDatabase } from '../db/database';
import { Transaction } from '../types';
import { TransactionCard } from '../components/TransactionCard';

type Filter = 'all' | 'income' | 'expense';

export function TransactionsScreen() {
  const dark = useColorScheme() === 'dark';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useFocusEffect(useCallback(() => {
    void (async () => {
      await initDatabase();
      setTransactions(await getTransactions());
    })();
  }, []));

  const filtered = transactions.filter((item) => filter === 'all' || item.type === filter);

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <View style={styles.filters}>
        {(['all', 'income', 'expense'] as const).map((item) => (
          <Pressable
            key={item}
            style={[styles.filter, filter === item && styles.filterActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item[0].toUpperCase() + item.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {filtered.length === 0
          ? <Text style={[styles.empty, dark && styles.textDark]}>No transactions found.</Text>
          : filtered.map((item) =>
              <TransactionCard key={item.id} transaction={item} dark={dark} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 16 },
  filter: { flex: 1, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  filterActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  filterText: { color: '#64748B', fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 40 },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 40 },
  textDark: { color: '#94A3B8' },
});
