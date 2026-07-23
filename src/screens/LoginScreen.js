import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import colors from '../constants/colors';
import { getUsers, addUser, saveSession } from '../services/storage';

// LoginScreen menangani DUA mode sekaligus: Login & Register,
// dikontrol lewat state "mode" + conditional rendering pada form dan tombol.
export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ nama: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setSuccess(false);
    setForm({ nama: '', email: '', password: '', confirm: '' });
  }

  function validateLogin() {
    if (!form.email.trim()) return 'Email tidak boleh kosong.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Format email tidak valid.';
    if (!form.password) return 'Password tidak boleh kosong.';
    if (form.password.length < 6) return 'Password minimal 6 karakter.';
    return null;
  }

  function validateRegister() {
    if (!form.nama.trim()) return 'Nama tidak boleh kosong.';
    if (!form.email.trim()) return 'Email tidak boleh kosong.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Format email tidak valid.';
    if (form.password.length < 6) return 'Password minimal 6 karakter.';
    if (form.password !== form.confirm) return 'Konfirmasi password tidak cocok.';
    return null;
  }

  async function handleLogin() {
    const validationError = validateLogin();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const users = await getUsers();
      const found = users.find(
        (u) => u.email.toLowerCase() === form.email.trim().toLowerCase()
      );

      if (!found) {
        setError('Akun tidak ditemukan. Silakan daftar terlebih dahulu.');
        setLoading(false);
        return;
      }
      if (found.password !== form.password) {
        setError('Password salah.');
        setLoading(false);
        return;
      }

      await saveSession({ nama: found.nama, email: found.email });
      setLoading(false);
      navigation.replace('Main');
    } catch (e) {
      setLoading(false);
      setError('Terjadi kesalahan. Coba lagi.');
    }
  }

  async function handleRegister() {
    const validationError = validateRegister();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const users = await getUsers();
      const exists = users.some(
        (u) => u.email.toLowerCase() === form.email.trim().toLowerCase()
      );
      if (exists) {
        setError('Email sudah terdaftar. Silakan login.');
        setLoading(false);
        return;
      }

      await addUser({
        nama: form.nama.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setLoading(false);
      setSuccess(true);
      setTimeout(() => switchMode('login'), 1200);
    } catch (e) {
      setLoading(false);
      setError('Terjadi kesalahan. Coba lagi.');
    }
  }

  function handleSubmit() {
    if (mode === 'login') handleLogin();
    else handleRegister();
  }

  const isLogin = mode === 'login';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏥</Text>
          <Text style={styles.appName}>Klinik Digital</Text>
          <Text style={styles.tagline}>Konsultasi kesehatan jadi lebih mudah</Text>
        </View>

        <View style={styles.card}>
          {/* Tab switch Login / Register */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabButton, isLogin && styles.tabButtonActive]}
              onPress={() => switchMode('login')}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                Masuk
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
              onPress={() => switchMode('register')}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                Daftar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conditional rendering: field Nama & Konfirmasi hanya muncul saat register */}
          {!isLogin && (
            <>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                placeholder="Nama kamu"
                value={form.nama}
                onChangeText={(v) => updateField('nama', v)}
              />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="nama@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimal 6 karakter"
            secureTextEntry
            value={form.password}
            onChangeText={(v) => updateField('password', v)}
          />

          {!isLogin && (
            <>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Ulangi password"
                secureTextEntry
                value={form.confirm}
                onChangeText={(v) => updateField('confirm', v)}
              />
            </>
          )}

          {/* Conditional rendering: error & success state */}
          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}
          {success ? (
            <Text style={styles.successText}>
              ✅ Berhasil daftar! Mengarahkan ke halaman masuk...
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Masuk' : 'Daftar'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => switchMode(isLogin ? 'register' : 'login')}
          >
            <Text style={styles.linkText}>
              {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <Text style={styles.linkBold}>
                {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 56 },
  appName: { fontSize: 26, fontWeight: '700', color: colors.white, marginTop: 8 },
  tagline: { fontSize: 13, color: '#E0F7F6', marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 4,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textLight },
  tabTextActive: { color: colors.white },
  label: { fontSize: 13, color: colors.textLight, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  errorText: { color: colors.danger, marginTop: 12, fontSize: 13 },
  successText: { color: colors.success, marginTop: 12, fontSize: 13 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  linkWrap: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 13, color: colors.textLight },
  linkBold: { color: colors.primary, fontWeight: '700' },
});