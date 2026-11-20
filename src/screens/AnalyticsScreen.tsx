import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-gifted-charts';
import { getTransactions, initDatabase } from '../db/database';
import { CategoryTotal, Transaction } from '../types';

const COLORS: Record<string, string> = {
  Food: '#6366F1',
  Transport: '#F59E0B',
  Utilities: '#10B981',
  Entertainment: '#EC4899',
  Other: '#3B82F6',
};

export function AnalyticsScreen() {
  const dark = useColorScheme() === 'dark';
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(useCallback(() => {
    void (async () => {
      await initDatabase();
      setTransactions(await getTransactions());
    })();
  }, []));

  const totals: CategoryTotal[] = Object.keys(COLORS).map((category) => ({
    category,
    amount: transactions
      .filter((item) => item.type === 'expense' && item.category === category)
      .reduce((total, item) => total + item.amount, 0),
    color: COLORS[category],
  })).filter((item) => item.amount > 0);

  const totalSpending = totals.reduce((total, item) => total + item.amount, 0);

  return (
    <ScrollView
      style={[styles.container, dark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total spending</Text>
        <Text style={styles.summaryAmount}>${totalSpending.toFixed(2)}</Text>
      </View>

      <View style={[styles.chartCard, dark && styles.chartCardDark]}>
        {totals.length > 0 ? (
          <>
            <PieChart
              data={totals.map((item) => ({
                value: item.amount,
                color: item.color,
              }))}
              donut
              radius={110}
              innerRadius={72}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text style={[styles.centerValue, dark && styles.textDark]}>
                    ${totalSpending.toFixed(0)}
                  </Text>
                  <Text style={styles.centerText}>Total</Text>
                </View>
              )}
            />
            <View style={styles.legend}>
              {totals.map((item) => (
                <View key={item.category} style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendName, dark && styles.textDark]}>{item.category}</Text>
                  <Text style={[styles.legendAmount, dark && styles.textDark]}>${item.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={[styles.empty, dark && styles.textDark]}>No expense data to display.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  content: { padding: 20 },
  summaryCard: { borderRadius: 18, backgroundColor: '#6366F1', padding: 18 },
  summaryLabel: { color: '#DDD6FE', fontSize: 13 },
  summaryAmount: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 4 },
  chartCard: { marginTop: 16, minHeight: 320, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 18 },
  chartCardDark: { backgroundColor: '#1E293B' },
  centerLabel: { alignItems: 'center' },
  centerValue: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  centerText: { color: '#64748B', fontSize: 12 },
  textDark: { color: '#F8FAFC' },
  legend: { width: '100%', marginTop: 20 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendName: { flex: 1, color: '#334155', fontWeight: '600' },
  legendAmount: { color: '#334155', fontWeight: '800' },
  empty: { color: '#64748B' },
});
