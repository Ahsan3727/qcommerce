import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: () => <Text>🏠</Text> }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: () => <Text>🛒</Text> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: () => <Text>📦</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: () => <Text>👤</Text> }} />
    </Tabs>
  );
}import { Slot, Tabs } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ActivityIndicator, View, Text } from 'react-native';

function AppContent() {
  const { token, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  if (!token) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Slot />  {/* Shows login/register screen */}
      </View>
    );
  }

  return (
    <CartProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#f97316' }}>
        <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: () => <Text>🏠</Text> }} />
        <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: () => <Text>🛒</Text> }} />
        <Tabs.Screen name="orders" options={{ title: 'My Orders', tabBarIcon: () => <Text>📦</Text> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: () => <Text>👤</Text> }} />
        <Tabs.Screen name="product/[id]" options={{ href: null }} />
        <Tabs.Screen name="order/[id]" options={{ href: null, title: 'Track' }} />
        <Tabs.Screen name="checkout" options={{ href: null }} />
      </Tabs>
    </CartProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
} 