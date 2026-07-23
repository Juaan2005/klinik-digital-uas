// Simulasi "API publik" untuk daftar dokter klinik.
// Di dunia nyata, ganti fetch() ini dengan endpoint REST API sungguhan.

const DUMMY_DOCTORS = [
  {
    id: 'd1',
    nama: 'dr. Amelia Putri, Sp.PD',
    spesialis: 'Penyakit Dalam',
    jadwal: 'Senin - Jumat, 08:00 - 12:00',
    rating: 4.8,
    foto: '👩‍⚕️',
    deskripsi:
      'Berpengalaman 10 tahun menangani penyakit dalam, diabetes, dan hipertensi.',
  },
  {
    id: 'd2',
    nama: 'dr. Bayu Santoso, Sp.A',
    spesialis: 'Anak',
    jadwal: 'Senin - Sabtu, 09:00 - 14:00',
    rating: 4.9,
    foto: '👨‍⚕️',
    deskripsi: 'Spesialis tumbuh kembang anak dan imunisasi.',
  },
  {
    id: 'd3',
    nama: 'dr. Citra Dewi, Sp.KK',
    spesialis: 'Kulit & Kelamin',
    jadwal: 'Selasa & Kamis, 13:00 - 17:00',
    rating: 4.7,
    foto: '👩‍⚕️',
    deskripsi: 'Menangani masalah kulit, alergi, dan estetika medis.',
  },
  {
    id: 'd4',
    nama: 'dr. Doni Pratama, Sp.OT',
    spesialis: 'Ortopedi',
    jadwal: 'Rabu & Jumat, 10:00 - 15:00',
    rating: 4.6,
    foto: '👨‍⚕️',
    deskripsi: 'Spesialis tulang, sendi, dan cedera olahraga.',
  },
  {
    id: 'd5',
    nama: 'dr. Eka Wulandari, Sp.OG',
    spesialis: 'Kandungan',
    jadwal: 'Senin - Kamis, 08:00 - 12:00',
    rating: 4.9,
    foto: '👩‍⚕️',
    deskripsi: 'Konsultasi kehamilan, USG, dan kesehatan reproduksi wanita.',
  },
];

// Simulasi delay network agar loading state terlihat natural
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchDoctors() {
  await delay(900);
  return DUMMY_DOCTORS;
}

export async function fetchDoctorById(id) {
  await delay(500);
  return DUMMY_DOCTORS.find((d) => d.id === id) || null;
}