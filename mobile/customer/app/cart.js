import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import { useRouter } from 'expo-router';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cart.length === 0) {
    return <View style={styles.empty}><Text style={styles.emptyText}>Cart is empty</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={item => item.product._id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.name}>{item.product.name}</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity onPress={() => updateQuantity(item.product._id, item.quantity - 1)}>
                <Text style={styles.qtyBtn}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.product._id, item.quantity + 1)}>
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.price}>Rs. {item.product.price * item.quantity}</Text>
            <TouchableOpacity onPress={() => removeFromCart(item.product._id)}>
              <Text style={styles.removeBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: Rs. {total}</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666' },
  cartItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 12, color: '#f97316' },
  qtyText: { fontSize: 18, marginHorizontal: 12 },
  price: { marginTop: 8, fontSize: 16, fontWeight: '700' },
  removeBtn: { marginTop: 8, color: '#ef4444', fontSize: 14 },
  footer: { paddingTop: 16, borderTopWidth: 1, borderColor: '#e2e8f0' },
  total: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  checkoutButton: { backgroundColor: '#f97316', borderRadius: 12, padding: 16, alignItems: 'center' },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 18 }
});