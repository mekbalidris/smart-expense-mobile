import { StyleSheet, Text, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Transaction } from '../types';

interface Props {
  transaction: Transaction;
  dark?: boolean;
}

export function TransactionCard({ transaction, dark = false }: Props) {
  const isExpense = transaction.type === 'expense';
  const foreground = dark ? '#F8FAFC' : '#0F172A';
  const muted = dark ? '#94A3B8' : '#64748B';

  return (
    <View style={[styles.card, dark && styles.cardDark]}>
      <View style={[styles.icon, { backgroundColor: isExpense ? '#FEF2F2' : '#ECFDF5' }]}>
        {isExpense
          ? <ArrowUpRight size={20} color="#EF4444" />
          : <ArrowDownLeft size={20} color="#10B981" />}
      </View>
      <View style={styles.details}>
        <Text style={[styles.category, { color: foreground }]}>{transaction.category}</Text>
        <Text style={[styles.note, { color: muted }]}>
          {transaction.note || new Date(transaction.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: isExpense ? '#EF4444' : '#10B981' }]}>
          {isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
        </Text>
        {!transaction.is_synced && <Text style={[styles.pending, { color: muted }]}>Pending</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardDark: { backgroundColor: '#1E293B' },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: { flex: 1, marginLeft: 12 },
  category: { fontSize: 15, fontWeight: '700' },
  note: { fontSize: 12, marginTop: 3 },
  amountContainer: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '800' },
  pending: { fontSize: 10, marginTop: 3 },
});
