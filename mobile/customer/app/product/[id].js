import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/api/products/${id}`).then(res => setProduct(res.data)).catch(console.log);
  }, [id]);

  if (!product) return <View style={styles.container}><Text>Loading...</Text></View>;

  const add = () => {
    addToCart({ ...product, wholesaler: product.wholesaler?._id || product.wholesaler }, quantity);
    alert('Added to cart');
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image || 'https://via.placeholder.com/150' }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>Rs. {product.price}</Text>
      <Text style={styles.description}>{product.description || 'No description'}</Text>
      <View style={styles.qtyRow}>
        <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q-1))} style={styles.qtyBtn}><Text style={styles.qtyText}>−</Text></TouchableOpacity>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <TouchableOpacity onPress={() => setQuantity(q => q+1)} style={styles.qtyBtn}><Text style={styles.qtyText}>+</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addCartButton} onPress={add}>
        <Text style={styles.addCartText}>Add to Cart - Rs. {product.price * quantity}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  image: { width: '100%', height: 250, borderRadius: 12, resizeMode: 'cover' },
  name: { fontSize: 24, fontWeight: '700', marginTop: 20 },
  price: { fontSize: 20, fontWeight: '700', color: '#f97316', marginVertical: 8 },
  description: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  qtyBtn: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8 },
  qtyText: { fontSize: 20, fontWeight: 'bold' },
  qtyValue: { fontSize: 20, marginHorizontal: 20 },
  addCartButton: { backgroundColor: '#f97316', padding: 16, borderRadius: 12, alignItems: 'center' },
  addCartText: { color: '#fff', fontWeight: '700', fontSize: 18 }
});