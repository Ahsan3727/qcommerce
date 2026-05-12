import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../utils/api';
import { useRouter } from 'expo-router';

export default function AvailableOrders() {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  const fetchAvailable = async () => {
    try {
      const res = await api.get('/api/orders/available-for-pickup');
      setOrders(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchAvailable(); }, []);

  const acceptOrder = async (orderId) => {
    try {
      // Assign self as rider and change status to picked_up?
      // Or just set rider field and status to picked_up? Actually, better: status stays ready_for_pickup until actual pickup, but we assign rider.
      // Let's add a new route: PATCH /api/orders/:id/assign-rider
      await api.patch(`/api/orders/${orderId}/status`, { status: 'picked_up' }); // this also sets rider via our existing logic
      router.replace(`/pickup?id=${orderId}`);
    } catch (err) {
      alert('Could not accept order');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => acceptOrder(item._id)}>
            <Text>#{item.orderNumber} - {item.wholesaler?.name}</Text>
            <Text>{item.items?.length} items</Text>
            <Text>Pickup address: {item.wholesaler?.address}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}