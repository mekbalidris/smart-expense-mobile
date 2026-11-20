import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, WalletCards } from 'lucide-react-native';
import { addTransaction, getTransactions, initDatabase } from '../db/database';
import { syncTransactions } from '../sync/syncManager';
import { Transaction } from '../types';
import { TransactionCard } from '../components/TransactionCard';
import { ChartCard } from '../components/ChartCard';

const CATEGORY_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#3B82F6'];

export function HomeScreen() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const load = useCallback(async () => {
    await initDatabase();
    setTransactions(await getTransactions());
  }, []);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const balance = transactions.reduce(
    (total, item) => total + (item.type === 'income' ? item.amount : -item.amount),
    0,
  );
  const spending = transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0);

  const categoryTotals = CATEGORY_COLORS.map((color, index) => {
    const names = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'];
    const amount = transactions
      .filter((item) => item.type === 'expense' && item.category === names[index])
      .reduce((total, item) => total + item.amount, 0);
    return { category: names[index], amount, color };
  }).filter((item) => item.amount > 0);

  const saveTransaction = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;

    await addTransaction({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      amount: numericAmount,
      category,
      type,
      note: note.trim(),
      date: new Date().toISOString(),
    });
    setAmount('');
    setNote('');
    setModalVisible(false);
    await load();
    void syncTransactions();
  };

  const colors = {
    background: dark ? '#0F172A' : '#F8FAFC',
    foreground: dark ? '#F8FAFC' : '#0F172A',
    muted: dark ? '#94A3B8' : '#64748B',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.muted }]}>Total balance</Text>
            <Text style={[styles.balance, { color: colors.foreground }]}>${balance.toFixed(2)}</Text>
          </View>
          <View style={styles.walletIcon}><WalletCards size={24} color="#FFFFFF" /></View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Monthly spending</Text>
          <Text style={styles.summaryAmount}>${spending.toFixed(2)}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Spending overview</Text>
        </View>
        {categoryTotals.length > 0
          ? <ChartCard data={categoryTotals} dark={dark} />
          : <Text style={[styles.empty, { color: colors.muted }]}>Add an expense to see your chart.</Text>}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent transactions</Text>
        </View>
        {transactions.length === 0
          ? <Text style={[styles.empty, { color: colors.muted }]}>No transactions yet.</Text>
          : transactions.slice(0, 5).map((item) =>
              <TransactionCard key={item.id} transaction={item} dark={dark} />)}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus size={26} color="#FFFFFF" />
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modal, dark && styles.modalDark]}>
            <Text style={[styles.modalTitle, dark && styles.textDark]}>Add transaction</Text>
            <View style={styles.typeRow}>
              {(['expense', 'income'] as const).map((item) => (
                <Pressable
                  key={item}
                  style={[styles.typeButton, type === item && styles.typeButtonActive]}
                  onPress={() => setType(item)}
                >
                  <Text style={[styles.typeText, type === item && styles.typeTextActive]}>
                    {item[0].toUpperCase() + item.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.input, dark && styles.inputDark]}
              placeholder="Amount"
              placeholderTextColor={dark ? '#94A3B8' : '#64748B'}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'].map((item) => (
                <Pressable
                  key={item}
                  style={[styles.categoryChip, category === item && styles.categoryChipActive]}
                  onPress={() => setCategory(item)}
                >
                  <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <TextInput
              style={[styles.input, dark && styles.inputDark]}
              placeholder="Note (optional)"
              placeholderTextColor={dark ? '#94A3B8' : '#64748B'}
              value={note}
              onChangeText={setNote}
            />
            <Pressable style={styles.saveButton} onPress={() => void saveTransaction()}>
              <Text style={styles.saveText}>Save transaction</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  eyebrow: { fontSize: 14 },
  balance: { fontSize: 36, fontWeight: '800', marginTop: 2 },
  walletIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  summaryCard: { marginTop: 18, borderRadius: 18, padding: 18, backgroundColor: '#6366F1' },
  summaryLabel: { color: '#DDD6FE', fontSize: 13 },
  summaryAmount: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 4 },
  sectionHeader: { marginTop: 22, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  empty: { textAlign: 'center', paddingVertical: 20 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 34 },
  modalDark: { backgroundColor: '#1E293B' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 14 },
  textDark: { color: '#F8FAFC' },
  typeRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  typeButton: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 10 },
  typeButtonActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  typeText: { color: '#64748B', fontWeight: '700' },
  typeTextActive: { color: '#FFFFFF' },
  input: { height: 48, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, marginBottom: 12, color: '#0F172A' },
  inputDark: { borderColor: '#475569', color: '#F8FAFC' },
  categoryRow: { marginBottom: 12, maxHeight: 38 },
  categoryChip: { height: 36, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 18, paddingHorizontal: 14, justifyContent: 'center', marginRight: 8 },
  categoryChipActive: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  categoryText: { color: '#64748B' },
  categoryTextActive: { color: '#4F46E5', fontWeight: '700' },
  saveButton: { backgroundColor: '#6366F1', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontWeight: '800' },
  cancelButton: { height: 40, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontWeight: '700' },
});
