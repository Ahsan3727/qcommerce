import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../context/CartContext';
import { useRouter } from 'expo-router';
import api from '../utils/api';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const [address, setAddress] = useState('House # 12, Street 5, Karachi');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const wholesalerId = cart.length > 0 ? cart[0].product.wholesaler : null;

  const placeOrder = async () => {
    if (!wholesalerId) {
      Alert.alert('Error', 'No wholesaler found');
      return;
    }
    setLoading(true);
    try {
      const items = cart.map(item => ({ product: item.product._id, quantity: item.quantity }));
      const res = await api.post('/api/orders', {
        wholesalerId,
        items,
        address,
        location: { lng: 67.001, lat: 24.860 },
        paymentMethod: 'cod'
      });
      clearCart();
      router.replace(`/order/${res.data._id}`);
    } catch (err) {
      Alert.alert('Order Failed', err.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <TextInput style={styles.input} placeholder="Delivery Address" value={address} onChangeText={setAddress} />
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        {cart.map(item => (
          <Text key={item.product._id} style={styles.item}>{item.product.name} x {item.quantity} = Rs. {item.product.price * item.quantity}</Text>
        ))}
        <Text style={styles.total}>Total: Rs. {total}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={placeOrder} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Place Order (COD)</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 14, marginBottom: 20 },
  summary: { marginBottom: 24 },
  summaryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  item: { fontSize: 14, marginLeft: 8, marginBottom: 4 },
  total: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  button: { backgroundColor: '#f97316', borderRadius: 12, padding: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 18 }
});