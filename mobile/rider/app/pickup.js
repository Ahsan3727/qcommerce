import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../utils/api';

export default function Pickup() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    api.get(`/api/orders/${id}`).then(res => setOrder(res.data)).catch(console.log);
  }, [id]);

  const confirmPickup = async () => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status: 'picked_up' });
      router.replace(`/delivery?id=${id}`);
    } catch (err) {
      Alert.alert('Error', 'Pickup failed');
    }
  };

  if (!order) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pickup Order</Text>
      <Text style={styles.detail}>From: {order.wholesaler?.name}</Text>
      <Text style={styles.detail}>Address: {order.wholesaler?.address}</Text>
      <Text style={styles.detail}>Items: {order.items.map(i => i.product?.name).join(', ')}</Text>
      <TouchableOpacity style={styles.button} onPress={confirmPickup}>
        <Text style={styles.buttonText}>Confirm Pickup</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  detail: { fontSize: 16, color: '#334155', marginBottom: 12 },
  button: { backgroundColor: '#2563eb', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 40 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 18 }
});