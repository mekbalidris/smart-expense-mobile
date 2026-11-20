import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart3, Home, List } from 'lucide-react-native';
import { initDatabase } from './src/db/database';
import { startSyncManager } from './src/sync/syncManager';
import { HomeScreen } from './src/screens/HomeScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    void initDatabase();
    const stopSync = startSyncManager();
    return () => stopSync();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: dark ? '#0F172A' : '#FFFFFF' },
          headerTintColor: dark ? '#F8FAFC' : '#0F172A',
          tabBarStyle: { backgroundColor: dark ? '#1E293B' : '#FFFFFF' },
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: dark ? '#94A3B8' : '#64748B',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{ tabBarIcon: ({ color, size }) => <List size={size} color={color} /> }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{ tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
