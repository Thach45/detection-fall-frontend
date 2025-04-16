import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = React.createContext<{
  login: () => void;
  logout: () => void;
  isLoggedIn: boolean;
}>({
  login: () => {},
  logout: () => {},
  isLoggedIn: false,
});

function useProtectedRoute(isLoggedIn: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';

    if (!isLoggedIn && inAuthGroup) {
      router.replace('/login');
    } else if (isLoggedIn && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments]);
}

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useProtectedRoute(isLoggedIn);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi khởi động app
    AsyncStorage.getItem('isLoggedIn').then(value => {
      setIsLoggedIn(value === 'true');
    });
  }, []);

  const authContext = {
    login: async () => {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
    },
    logout: async () => {
      await AsyncStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);
    },
    isLoggedIn,
  };

  return (
    <AuthContext.Provider value={authContext}>
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </AuthContext.Provider>
  );
}
