import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { fetchDoctors } from '../services/api';
import { getSession } from '../services/storage';

export default function HomeScreen({ navigation }) {
  // 3 state berbeda: doctors (data), loading, dan userName
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const session = await getSession();
      const data = await fetchDoctors();
      if (isMounted) {
        setUserName(session?.nama || 'Pasien');
        setDoctors(data);
        setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {userName} 👋</Text>
        <Text style={styles.subheading}>Pilih dokter untuk konsultasi</Text>
      </View>

      {/* Conditional rendering: loading state */}
      {loading ? (
        <LoadingSpinner label="Memuat daftar dokter..." />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
          // Conditional rendering: empty state
          ListEmptyComponent={
            <EmptyState
              icon="🩺"
              title="Belum ada dokter tersedia"
              subtitle="Coba periksa kembali nanti."
            />
          }
          renderItem={({ item }) => (
            <ItemCard
              emoji={item.foto}
              title={item.nama}
              subtitle={item.spesialis}
              meta={item.jadwal}
              badge={`⭐ ${item.rating}`}
              onPress={() =>
                navigation.navigate('DetailScreen', { doctorId: item.id })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingBottom: 8 },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 13, color: colors.textLight, marginTop: 4 },
});