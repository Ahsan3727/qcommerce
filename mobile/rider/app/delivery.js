import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../utils/api';

export default function Delivery() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    api.get(`/api/orders/${id}`).then(res => setOrder(res.data)).catch(console.log);
  }, [id]);

  const markDelivered = async () => {
    if (otp !== order.otp) {
      Alert.alert('Invalid OTP');
      return;
    }
    try {
      await api.patch(`/api/orders/${id}/status`, { status: 'delivered' });
      Alert.alert('Success', 'Order delivered', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert('Error', 'Delivery failed');
    }
  };

  if (!order) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deliver Order</Text>
      <Text style={styles.address}>Customer: {order.deliveryAddress}</Text>
      <Text style={styles.label}>Enter OTP</Text>
      <TextInput style={styles.input} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={4} />
      <TouchableOpacity style={styles.button} onPress={markDelivered}>
        <Text style={styles.buttonText}>Mark as Delivered</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  address: { fontSize: 16, marginBottom: 24, color: '#334155' },
  label: { fontSize: 18, marginBottom: 12, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 14, fontSize: 20, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#16a34a', borderRadius: 14, padding: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 18 }
});