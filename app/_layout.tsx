import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  phoneEmergency: string;
  deviceId: string;
  fullName: string;
  // Add other user fields as needed
}

interface AuthContextType {
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  user: User | null;
}

export const AuthContext = React.createContext<AuthContextType>({
  login: async () => {},
  logout: async () => {},
  isLoggedIn: false,
  user: null,
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
  const [user, setUser] = useState<User | null>(null);

  useProtectedRoute(isLoggedIn);

  useEffect(() => {
    // Check login state and user data on app start
    const loadAuthState = async () => {
      try {
        const [loginState, userData] = await Promise.all([
          AsyncStorage.getItem('isLoggedIn'),
          AsyncStorage.getItem('userData')
        ]);
        
        if (loginState === 'true' && userData) {
          setIsLoggedIn(true);
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      }
    };

    loadAuthState();
  }, []);

  const authContext: AuthContextType = {
    login: async (userData: User) => {
      try {
        await Promise.all([
          AsyncStorage.setItem('isLoggedIn', 'true'),
          AsyncStorage.setItem('userData', JSON.stringify(userData))
        ]);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error saving auth state:', error);
        throw new Error('Lỗi lưu thông tin đăng nhập');
      }
    },
    logout: async () => {
      try {
        await Promise.all([
          AsyncStorage.removeItem('isLoggedIn'),
          AsyncStorage.removeItem('userData')
        ]);
        setUser(null);
        setIsLoggedIn(false);
      } catch (error) {
        console.error('Error clearing auth state:', error);
        throw new Error('Lỗi đăng xuất');
      }
    },
    isLoggedIn,
    user,
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
