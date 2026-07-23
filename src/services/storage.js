import AsyncStorage from '@react-native-async-storage/async-storage';

// Kunci-kunci penyimpanan lokal.
const KEYS = {
  SESSION: '@klinik_digital:session',
  USERS: '@klinik_digital:users',
  HISTORY: '@klinik_digital:consultation_history',
  PROFILE_PHOTO: '@klinik_digital:profile_photo',
};

/* ---------------- SESSION (data domain #1) ---------------- */

export async function saveSession(user) {
  await AsyncStorage.setItem(KEYS.SESSION, JSON.stringify(user));
}

export async function getSession() {
  const raw = await AsyncStorage.getItem(KEYS.SESSION);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(KEYS.SESSION);
}

/* ---------------- USERS (untuk simulasi register/login) ---------------- */

export async function getUsers() {
  const raw = await AsyncStorage.getItem(KEYS.USERS);
  return raw ? JSON.parse(raw) : [];
}

export async function addUser(user) {
  const users = await getUsers();
  users.push(user);
  await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

/* ---------------- HISTORY KONSULTASI (data domain #2) ---------------- */

export async function getHistory() {
  const raw = await AsyncStorage.getItem(KEYS.HISTORY);
  return raw ? JSON.parse(raw) : [];
}

export async function addHistory(entry) {
  const history = await getHistory();
  const updated = [entry, ...history];
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  return updated;
}

export async function clearHistory() {
  await AsyncStorage.removeItem(KEYS.HISTORY);
}

/* ---------------- FOTO KTP PROFIL ---------------- */

export async function saveProfilePhoto(uri) {
  await AsyncStorage.setItem(KEYS.PROFILE_PHOTO, uri);
}

export async function getProfilePhoto() {
  return AsyncStorage.getItem(KEYS.PROFILE_PHOTO);
}

export default {
  saveSession,
  getSession,
  clearSession,
  getUsers,
  addUser,
  getHistory,
  addHistory,
  clearHistory,
  saveProfilePhoto,
  getProfilePhoto,
};