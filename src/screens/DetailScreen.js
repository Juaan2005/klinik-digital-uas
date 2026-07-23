import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../constants/colors';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { fetchDoctorById } from '../services/api';
import { addHistory, getHistory } from '../services/storage';

// DetailScreen punya DUA mode, ditentukan lewat conditional rendering:
// 1) route.params berisi doctorId -> tampil profil dokter + form booking
//    (dipanggil dari HomeScreen saat memilih dokter, via Stack di dalam tab Home)
// 2) route.params kosong -> tampil sebagai tab "Booking": daftar booking aktif
export default function DetailScreen({ route, navigation }) {
  const doctorId = route.params?.doctorId;

  if (doctorId) {
    return <DoctorBookingView doctorId={doctorId} navigation={navigation} />;
  }
  return <ActiveBookingListView navigation={navigation} />;
}

/* ---------------------------------------------------------------
   MODE 1: Detail dokter + form booking konsultasi
--------------------------------------------------------------- */
function DoctorBookingView({ doctorId, navigation }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keluhan, setKeluhan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDoctor() {
      setLoading(true);
      const data = await fetchDoctorById(doctorId);
      if (isMounted) {
        setDoctor(data);
        setLoading(false);
      }
    }
    loadDoctor();
    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  function validate() {
    if (!tanggal.trim()) return 'Tanggal konsultasi tidak boleh kosong.';
    if (!/^\d{2}-\d{2}-\d{4}$/.test(tanggal.trim())) {
      return 'Format tanggal harus DD-MM-YYYY, contoh: 25-07-2026.';
    }
    if (!keluhan.trim()) return 'Keluhan tidak boleh kosong.';
    if (keluhan.trim().length < 10) return 'Keluhan minimal 10 karakter.';
    return null;
  }

  async function handleBooking() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);

    const entry = {
      id: Date.now().toString(),
      doctorName: doctor.nama,
      spesialis: doctor.spesialis,
      tanggal: tanggal.trim(),
      keluhan: keluhan.trim(),
      status: 'Menunggu Konfirmasi',
      createdAt: new Date().toISOString(),
    };

    await addHistory(entry);
    setSubmitting(false);
    setBooked(true);
  }

  if (loading) {
    return <LoadingSpinner label="Memuat detail dokter..." />;
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text>Dokter tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.profileCard}>
        <Text style={styles.avatar}>{doctor.foto}</Text>
        <Text style={styles.name}>{doctor.nama}</Text>
        <Text style={styles.specialty}>{doctor.spesialis}</Text>
        <Text style={styles.rating}>⭐ {doctor.rating} · {doctor.jadwal}</Text>
        <Text style={styles.desc}>{doctor.deskripsi}</Text>
      </View>

      {/* Conditional rendering: form booking vs pesan sukses */}
      {booked ? (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>✅ Booking Berhasil!</Text>
          <Text style={styles.successText}>
            Konsultasi kamu dengan {doctor.nama} pada {tanggal} sudah tercatat.
            Cek tab "Booking" untuk melihat statusnya.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Booking')}
          >
            <Text style={styles.buttonText}>Lihat Booking</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Form Booking Konsultasi</Text>

          <Text style={styles.label}>Tanggal Konsultasi</Text>
          <TextInput
            style={styles.input}
            placeholder="DD-MM-YYYY, contoh: 25-07-2026"
            value={tanggal}
            onChangeText={setTanggal}
          />

          <Text style={styles.label}>Keluhan</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Jelaskan keluhan kamu minimal 10 karakter..."
            multiline
            numberOfLines={4}
            value={keluhan}
            onChangeText={setKeluhan}
          />

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleBooking}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Konfirmasi Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/* ---------------------------------------------------------------
   MODE 2: Daftar booking aktif (tab "Booking")
--------------------------------------------------------------- */
function ActiveBookingListView() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // useFocusEffect agar data ter-refresh tiap kali tab Booking dibuka
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function loadPending() {
        setLoading(true);
        const history = await getHistory();
        const pending = history.filter((h) => h.status === 'Menunggu Konfirmasi');
        if (isMounted) {
          setBookings(pending);
          setLoading(false);
        }
      }
      loadPending();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Aktif</Text>
        <Text style={styles.subtitle}>
          Konsultasi yang sedang menunggu konfirmasi klinik
        </Text>
      </View>

      {/* Conditional rendering: loading / empty / data */}
      {loading ? (
        <LoadingSpinner label="Memuat booking..." />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
          ListEmptyComponent={
            <EmptyState
              icon="📅"
              title="Belum ada booking aktif"
              subtitle="Booking konsultasi dari tab Beranda terlebih dahulu."
            />
          }
          renderItem={({ item }) => (
            <ItemCard
              emoji="🩺"
              title={item.doctorName}
              subtitle={item.spesialis}
              meta={`Tanggal: ${item.tanggal}`}
              badge={item.status}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  avatar: { fontSize: 56 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 8 },
  specialty: { fontSize: 14, color: colors.primaryDark, marginTop: 2 },
  rating: { fontSize: 12, color: colors.textLight, marginTop: 6 },
  desc: { fontSize: 13, color: colors.text, marginTop: 12, textAlign: 'center' },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
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
  textArea: { height: 100, textAlignVertical: 'top' },
  errorText: { color: colors.danger, marginTop: 12, fontSize: 13 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  successCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  successTitle: { fontSize: 16, fontWeight: '700', color: colors.success },
  successText: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
});