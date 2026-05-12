import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';

const statusFlow = ['accepted', 'preparing', 'ready_for_pickup'];

export default function OrderDetail() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);

  useEffect(() => { api.get(`/api/orders/${id}`).then(res => setOrder(res.data)).catch(console.log); }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) { Alert.alert('Error'); }
  };

  const nextStep = () => {
    const idx = statusFlow.indexOf(order.status);
    if (idx < statusFlow.length - 1) updateStatus(statusFlow[idx + 1]);
  };

  if (!order) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{order.orderNumber}</Text>
      <Text style={styles.status}>Status: {order.status}</Text>
      <Text style={styles.sectionTitle}>Items:</Text>
      {order.items.map((item, idx) => (
        <Text key={idx} style={styles.item}>• {item.product?.name} x {item.quantity}</Text>
      ))}
      <Text style={styles.total}>Total: Rs. {order.totalAmount}</Text>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <TouchableOpacity style={styles.button} onPress={nextStep} disabled={!['accepted','preparing'].includes(order.status)}>
          <Text style={styles.buttonText}>
            {order.status === 'accepted' ? 'Start Preparing' : order.status === 'preparing' ? 'Mark Ready for Pickup' : 'No further action'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
  status: { fontSize: 16, color: '#64748b', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  item: { fontSize: 16, color: '#334155', marginLeft: 8, marginBottom: 4 },
  total: { fontSize: 20, fontWeight: '700', marginVertical: 24, color: '#0f172a' },
  button: { backgroundColor: '#2563eb', borderRadius: 14, padding: 16, alignItems: 'center', opacity: 0.8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 18 }
});