import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { API_URL } from '../config';


export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('03001112233');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
  setError('');
  setLoading(true);
  try {
    console.log('📱 Login attempt');
    console.log('URL:', `${API_URL}/api/auth/login`);
    console.log('Payload:', JSON.stringify({ phone, password, role: 'wholesaler' })); // change role for rider

    await login(phone, password);
    console.log('✅ Login success, navigating to dashboard');
    router.replace('/dashboard');
  } catch (err) {
    console.log('❌ Login error details:');
    console.log('Error message:', err.message);
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Data:', JSON.stringify(err.response.data));
      setError(`Server: ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      console.log('No response received');
      setError('No response from server. Check IP and network.');
    } else {
      setError(err.message);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rider Login</Text>
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});