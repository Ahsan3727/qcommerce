import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import api from '../utils/api';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [online, setOnline] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [myOrders, avail] = await Promise.all([
        api.get('/api/orders?status=picked_up'),  // orders already picked up by this rider
        api.get('/api/orders/available-for-pickup')
      ]);
      setAssignedOrders(myOrders.data);
      setAvailableOrders(avail.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleOnline = async () => {
    await api.patch('/api/riders/status', { online: !online });
    setOnline(!online);
  };

  const acceptOrder = async (orderId) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: 'picked_up' });
      router.replace(`/pickup?id=${orderId}`);
    } catch (err) { alert('Cannot accept order'); }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleOnline} style={[styles.toggle, online ? styles.online : styles.offline]}>
        <Text style={styles.toggleText}>{online ? '🟢 Online' : '🔴 Go Online'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Available Orders</Text>
      <FlatList
        data={availableOrders}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => acceptOrder(item._id)} disabled={!online}>
            <Text style={styles.store}>#{item.orderNumber} - {item.wholesaler?.name}</Text>
            <Text>{item.items?.length} items | Total: Rs. {item.totalAmount}</Text>
            <Text>Pickup: {item.wholesaler?.address}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#94a3b8', padding: 10 }}>No available orders</Text>}
      />
      <Text style={styles.sectionTitle}>My Deliveries</Text>
      <FlatList
        data={assignedOrders}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/delivery?id=${item._id}`)}>
            <Text style={styles.store}>#{item.orderNumber} - {item.wholesaler?.name}</Text>
            <Text>Status: {item.status}</Text>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl onRefresh={fetchData} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f8fc' },
  toggle: { padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  online: { backgroundColor: '#16a34a' },
  offline: { backgroundColor: '#94a3b8' },
  toggleText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1 },
  store: { fontWeight: '600', fontSize: 16 }
});