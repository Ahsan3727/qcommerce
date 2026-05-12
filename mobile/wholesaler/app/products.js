import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  StyleSheet, Alert, RefreshControl, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../utils/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const fetchProducts = async () => {
    setFetchError('');
    try {
      const res = await api.get('/api/products/mine');
      setProducts(res.data);
    } catch (err) {
      console.log('Fetch error:', err.response?.status, err.response?.data || err.message);
      setFetchError('Could not load products. Pull to retry.');
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const addProduct = async () => {
    if (!name.trim() || !price.trim() || !stock.trim()) {
      Alert.alert('Missing Fields', 'Please fill in name, price, and stock.');
      return;
    }

    setSaving(true);
    try {
      console.log('➡️ Adding product:', { name, price, stock });
      const res = await api.post('/api/products', {
        name: name.trim(),
        price: Number(price),
        stock: Number(stock)
      });
      console.log('✅ Product created:', res.data._id);
      setModalVisible(false);
      setName(''); setPrice(''); setStock('');
      fetchProducts();   // refresh list
    } catch (err) {
      console.log('❌ Save failed:', err.response?.status, err.response?.data || err.message);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      Alert.alert('Save Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add New Product</Text>
      </TouchableOpacity>

      {fetchError ? <Text style={styles.errorText}>{fetchError}</Text> : null}

      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.productDetails}>
              <Text style={styles.productPrice}>Rs. {item.price}</Text>
              <Text style={styles.productStock}>Stock: {item.stock}</Text>
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 30, color: '#94a3b8' }}>
            No products yet. Tap the button to add.
          </Text>
        }
      />

      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Product</Text>

            <TextInput
              style={styles.input}
              placeholder="Product name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Price (Rs.)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Stock quantity"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              onPress={addProduct}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Save Product</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 12 }}
              disabled={saving}
            >
              <Text style={{ textAlign: 'center', color: '#64748b', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc', paddingHorizontal: 16, paddingTop: 20 },
  addButton: {
    backgroundColor: '#f97316', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 20
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  errorText: { color: '#dc2626', textAlign: 'center', marginBottom: 10, fontSize: 14 },
  productCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1
  },
  productName: { fontSize: 16, fontWeight: '600', flex: 1 },
  productDetails: { alignItems: 'flex-end' },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  productStock: { fontSize: 13, color: '#64748b', marginTop: 4 },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    width: '85%', backgroundColor: '#fff', borderRadius: 20,
    padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 5
  },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
    padding: 14, marginBottom: 12, fontSize: 16, backgroundColor: '#f8fafc'
  },
  saveButton: {
    backgroundColor: '#16a34a', borderRadius: 10, padding: 14,
    alignItems: 'center', marginTop: 8
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});