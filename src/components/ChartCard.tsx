import { StyleSheet, Text, View } from 'react-native';
import { CategoryTotal } from '../types';

interface Props {
  data: CategoryTotal[];
  dark?: boolean;
}

export function ChartCard({ data, dark = false }: Props) {
  const max = Math.max(...data.map((item) => item.amount), 1);

  return (
    <View style={[styles.card, dark && styles.cardDark]}>
      {data.map((item) => (
        <View key={item.category} style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, dark && styles.textDark]}>{item.category}</Text>
            <Text style={[styles.value, dark && styles.textDark]}>${item.amount.toFixed(2)}</Text>
          </View>
          <View style={[styles.track, dark && styles.trackDark]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: item.color,
                  width: `${Math.max((item.amount / max) * 100, 4)}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16 },
  cardDark: { backgroundColor: '#1E293B' },
  row: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#334155', fontWeight: '700' },
  value: { color: '#334155', fontWeight: '800' },
  textDark: { color: '#F8FAFC' },
  track: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  trackDark: { backgroundColor: '#334155' },
  fill: { height: '100%', borderRadius: 4 },
});
