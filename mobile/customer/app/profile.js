import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 40 },
  logoutBtn: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 18 }
});