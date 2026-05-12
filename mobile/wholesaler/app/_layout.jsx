import { Slot, Tabs } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutInner() {
  const { token, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  if (!token) return <Slot />;   // shows login screen

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Orders', tabBarIcon: () => null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null, title: 'Order Detail' }} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}