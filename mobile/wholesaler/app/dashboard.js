import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import api from '../utils/api';
import { SOCKET_URL } from '../config';
import io from 'socket.io-client';
import { useRouter } from 'expo-router';

const socket = io(SOCKET_URL);

export default function Dashboard() {
  const [orders, setOrders] = useState({ active: [], completed: [] });
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders?status=pending,accepted,preparing,ready_for_pickup,picked_up,delivered');
      const active = res.data.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
      const completed = res.data.filter(o => o.status === 'delivered');
      setOrders({ active, completed });
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchOrders();
    socket.on('newOrder', (order) => {
      setOrders(prev => ({ ...prev, active: [order, ...prev.active] }));
    });
    socket.on('orderUpdated', (updated) => {
      fetchOrders(); // refresh on update
    });
    return () => {
      socket.off('newOrder');
      socket.off('orderUpdated');
    };
  }, []);

  const renderOrder = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/order/${item._id}`)}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <Text style={[styles.badge, item.status === 'delivered' ? styles.delivered : styles.active]}>{item.status}</Text>
      </View>
      <Text style={styles.items}>{item.items?.length} items</Text>
      <Text style={styles.amount}>Rs. {item.totalAmount}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Active Orders</Text>
      <FlatList
        data={orders.active}
        keyExtractor={item => item._id}
        renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
        ListEmptyComponent={<Text style={{ color: '#94a3b8', padding: 20 }}>No active orders</Text>}
      />
      <Text style={styles.sectionTitle}>Completed Sales</Text>
      <FlatList
        data={orders.completed}
        keyExtractor={item => item._id}
        renderItem={renderOrder}
        ListEmptyComponent={<Text style={{ color: '#94a3b8', padding: 20 }}>No sales yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc', paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#1e293b' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: '600' },
  active: { backgroundColor: '#fef3c7', color: '#b45309' },
  delivered: { backgroundColor: '#d1fae5', color: '#065f46' },
  items: { marginTop: 8, color: '#64748b' },
  amount: { marginTop: 4, fontWeight: '600', fontSize: 16 }
});