import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AuthContext } from './_layout';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://detection-fall-backend-production.up.railway.app/api';

interface LoginResponse {
  message: string;
  user: {
    phoneEmergency: string;
    deviceId: string;
    fullName: string;
  };
}

interface ApiError {
  message: string;
}

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [phoneEmergency, setPhoneEmergency] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneEmergency.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại khẩn cấp và mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneEmergency: phoneEmergency.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json() as LoginResponse | ApiError;

      if (!response.ok) {
        throw new Error('message' in data ? data.message : 'Đăng nhập thất bại');
      }
      await AsyncStorage.setItem('phoneEmergency', phoneEmergency.trim());
      // Type guard to ensure we have a LoginResponse
      if ('user' in data) {
        // Save user data and token if needed
        await login(data.user);
        
        // Reset form
        setPhoneEmergency('');
        setPassword('');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/logup');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Hệ thống giám sát té ngã</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <FontAwesome name="phone" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại khẩn cấp"
              value={phoneEmergency}
              onChangeText={setPhoneEmergency}
              keyboardType="phone-pad"
              autoCapitalize="none"
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="sign-in" size={20} color="#fff" />
                <Text style={styles.loginButtonText}> Đăng nhập</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerText}>
              Chưa có tài khoản? Đăng ký ngay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#89CFF0',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  noteContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  registerButton: {
    marginTop: 15,
    padding: 10,
  },
  registerText: {
    color: '#2196F3',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});