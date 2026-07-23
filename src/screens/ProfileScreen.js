import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../constants/colors';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  getSession,
  clearSession,
  getProfilePhoto,
  saveProfilePhoto,
  getHistory,
} from '../services/storage';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Load profil & foto KTP sekali saat screen pertama kali mount
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      setLoading(true);
      const session = await getSession();
      const photo = await getProfilePhoto();
      if (isMounted) {
        setUser(session);
        setPhotoUri(photo);
        setLoading(false);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Riwayat konsultasi di-refresh tiap kali tab Profil dibuka/difokuskan
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function loadHistory() {
        const data = await getHistory();
        if (isMounted) setHistory(data);
      }
      loadHistory();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  async function handleTakeKtpPhoto() {
    // Wajib: handle permission request dan denied state
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      setPermissionDenied(true);
      Alert.alert(
        'Izin Kamera Ditolak',
        'Klinik Digital membutuhkan akses kamera untuk memfoto KTP kamu. Aktifkan izin kamera di pengaturan HP.'
      );
      return;
    }

    setPermissionDenied(false);

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: true,
      aspect: [16, 10],
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      await saveProfilePhoto(uri);
    }
  }

  async function handleLogout() {
    await clearSession();
    // ProfileScreen berada di dalam Tab Navigator, jadi navigasi ke Login
    // harus lewat parent (Root Stack Navigator).
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.replace('Login');
    } else {
      navigation.replace('Login');
    }
  }

  if (loading) {
    return <LoadingSpinner label="Memuat profil..." />;
  }

  return (
    <FlatList
      style={styles.container}
      data={history}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {user?.nama?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            </View>
            <Text style={styles.name}>{user?.nama || 'Pasien'}</Text>
            <Text style={styles.email}>{user?.email || '-'}</Text>
          </View>

          <View style={styles.ktpCard}>
            <Text style={styles.sectionTitle}>Foto KTP</Text>

            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.ktpImage} />
            ) : (
              <View style={styles.ktpPlaceholder}>
                <Text style={styles.placeholderText}>Belum ada foto KTP</Text>
              </View>
            )}

            {permissionDenied ? (
              <Text style={styles.errorText}>
                ⚠️ Izin kamera ditolak. Buka pengaturan HP untuk mengaktifkannya.
              </Text>
            ) : null}

            <TouchableOpacity style={styles.button} onPress={handleTakeKtpPhoto}>
              <Text style={styles.buttonText}>
                {photoUri ? '📷 Ambil Ulang Foto KTP' : '📷 Ambil Foto KTP'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>

          <Text style={styles.historyTitle}>Riwayat Konsultasi</Text>
        </>
      }
      ListEmptyComponent={
        <EmptyState
          icon="🗂️"
          title="Belum ada riwayat konsultasi"
          subtitle="Riwayat akan muncul setelah kamu booking dokter."
        />
      }
      renderItem={({ item }) => (
        <ItemCard
          emoji="📋"
          title={item.doctorName}
          subtitle={`${item.spesialis} · ${item.tanggal}`}
          meta={item.keluhan}
          badge={item.status}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 20, paddingHorizontal: 20 },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 28, color: colors.white, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 10 },
  email: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  ktpCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  ktpImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  ktpPlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: { color: colors.textLight, fontSize: 13 },
  errorText: { color: colors.danger, fontSize: 12, marginBottom: 10 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  logoutButton: {
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 28,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
});