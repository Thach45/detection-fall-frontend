import { useEffect, useState } from 'react';
import { StyleSheet, Alert, Text, View, Platform } from 'react-native';
import io from 'socket.io-client';

// Thay đổi IP này thành IP của máy chủ của bạn
const SOCKET_URL = 'http://localhost:3000'; // Địa chỉ máy chủ Socket.IO

export default function TabOneScreen() {
  const [connectionStatus, setConnectionStatus] = useState('Đang kết nối...');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    console.log('Connecting to:', SOCKET_URL);
    
    // Khởi tạo Socket.IO với cấu hình
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    // Xử lý các sự kiện Socket.IO
    socket.on('connect', () => {
      setConnectionStatus('Đã kết nối');
      console.log('✅ Socket.IO connected');
    });

    socket.on('connection_confirmed', (data) => {
      console.log('Server confirmed:', data);
      setLastUpdate('Kết nối thành công lúc: ' + new Date().toLocaleTimeString());
    });

    socket.on('fall_detected', (data) => {
      console.log('Fall detected:', data);
      setLastUpdate('Phát hiện té ngã lúc: ' + new Date().toLocaleTimeString());
      
      Alert.alert(
        '🚨 Phát hiện té ngã!',
        `${data.message}\n\nVị trí: ${data.location?.latitude}, ${data.location?.longitude}\nThời gian: ${data.timestamp}`,
        [
          {
            text: 'Đã hiểu',
            onPress: () => console.log('Alert closed'),
            style: 'default',
          },
        ],
        { cancelable: false }
      );
    });

    socket.on('disconnect', (reason) => {
      setConnectionStatus('Mất kết nối');
      console.log('❌ Socket.IO disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      setConnectionStatus('Lỗi kết nối');
      console.error('Connection error:', error);
      setLastUpdate('Lỗi kết nối lúc: ' + new Date().toLocaleTimeString());
    });

    // Cleanup khi component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>Giám sát té ngã</Text>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: connectionStatus === 'Đã kết nối' ? '#4CAF50' : '#f44336' }
        ]} />
        <Text style={styles.statusText}>
          Trạng thái: {connectionStatus}
        </Text>
        {lastUpdate && (
          <Text style={styles.updateText}>
            {lastUpdate}
          </Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.description}>
          Ứng dụng đang theo dõi tín hiệu từ thiết bị IoT.
          {'\n'}Bạn sẽ nhận được thông báo khi phát hiện té ngã.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000'
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000'
  },
  updateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20
  },
  infoContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#e3f2fd',
    marginTop: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#000'
  },
});