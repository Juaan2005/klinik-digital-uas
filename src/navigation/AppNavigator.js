import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import colors from '../constants/colors';
import { getSession } from '../services/storage';
import LoadingSpinner from '../components/LoadingSpinner';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const RootStack = createNativeStackNavigator();
const HomeStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Beranda: '🏠',
  Booking: '📅',
  Profil: '👤',
};

function TabIcon({ label, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
      {TAB_ICONS[label]}
    </Text>
  );
}

// Stack khusus tab Beranda -> Detail Dokter (nested Stack Navigator di dalam Tab).
// DetailScreen dipanggil di sini DENGAN params { doctorId } -> mode "detail dokter".
function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackNav.Screen
        name="DetailScreen"
        component={DetailScreen}
        options={{ headerShown: true, title: 'Detail Dokter' }}
      />
    </HomeStackNav.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Beranda" component={HomeStack} />
      {/* Tab "Booking" memanggil DetailScreen TANPA params -> mode "daftar booking aktif" */}
      <Tab.Screen name="Booking" component={DetailScreen} initialParams={{}} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      setInitialRoute(session ? 'Main' : 'Login');
      setCheckingSession(false);
    }
    checkSession();
  }, []);

  if (checkingSession) {
    return <LoadingSpinner label="Menyiapkan aplikasi..." />;
  }

  return (
    <RootStack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="Main" component={MainTabs} />
    </RootStack.Navigator>
  );
}