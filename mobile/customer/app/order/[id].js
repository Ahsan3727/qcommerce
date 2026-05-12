import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../config';

const socket = io(SOCKET_URL);

export default function OrderTracking() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/api/orders/${id}`).then(res => setOrder(res.data)).catch(console.log);
    socket.emit('joinOrderRoom', id);
    socket.on('orderStatusChanged', (data) => {
      if (data.orderId === id) setOrder(prev => prev ? { ...prev, status: data.status } : prev);
    });
    return () => socket.off('orderStatusChanged');
  }, [id]);

  if (!order) return <View style={styles.container}><Text>Loading...</Text></View>;

  const steps = ['pending','accepted','preparing','ready_for_pickup','picked_up','delivered'];
  const current = steps.indexOf(order.status);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{order.orderNumber}</Text>
      <Text style={styles.total}>Total: Rs. {order.totalAmount}</Text>
      <Text style={styles.otp}>Your OTP: {order.otp}</Text>
      <View style={styles.timeline}>
        {steps.map((step, idx) => (
          <View key={step} style={styles.step}>
            <View style={[styles.dot, idx <= current ? styles.activeDot : styles.inactiveDot]} />
            <Text style={[styles.label, idx <= current && styles.activeLabel]}>{step.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  total: { fontSize: 18, fontWeight: '500', marginBottom: 12 },
  otp: { fontSize: 18, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 30 },
  timeline: { marginTop: 20 },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  activeDot: { backgroundColor: '#f97316' },
  inactiveDot: { backgroundColor: '#cbd5e1' },
  label: { fontSize: 16, color: '#64748b' },
  activeLabel: { color: '#f97316', fontWeight: '600' }
});