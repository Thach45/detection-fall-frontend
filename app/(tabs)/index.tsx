import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Alert, Text, View, Platform, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { AuthContext } from '../_layout';
import io from 'socket.io-client';

const SOCKET_URL = "https://detection-fall-backend-production.up.railway.app/"; // Địa chỉ WebSocket server

// HTML template cho OpenStreetMap với Leaflet
const getMapHTML = (latitude: number, longitude: number) => `
<!DOCTYPE html>
<html>
<head>
    <title>Fall Location</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; }
        #map { height: 100vh; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        const map = L.map('map').setView([${latitude}, ${longitude}], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        L.marker([${latitude}, ${longitude}])
            .addTo(map)
            .bindPopup('Vị trí té ngã')
            .openPopup();
    </script>
</body>
</html>
`;

export default function TabOneScreen() {
  const [connectionStatus, setConnectionStatus] = useState('Đang kết nối...');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const { user } = useContext(AuthContext);
  const [fallLocation, setFallLocation] = useState<{
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    console.log('Connecting to:', SOCKET_URL);
    
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socket.on('connect', () => {
      setConnectionStatus('Đã kết nối');
      console.log('✅ Socket.IO connected');
      
      // Đăng ký deviceId với server khi kết nối thành công
      if (user?.deviceId) {
        socket.emit('register_device', user.deviceId);
        console.log('📱 Registering device:', user.deviceId);
      }
    });

    socket.on('registered', (response) => {
      console.log('📱 Device registration response:', response);
    });

    socket.on('connection_confirmed', (data) => {
      console.log('Server confirmed:', data);
      setLastUpdate('Kết nối thành công lúc: ' + new Date().toLocaleTimeString());
    });

    socket.on('fall_detected', (data) => {
      console.log('Fall detected:', data);
      // Chỉ xử lý nếu deviceId trùng khớp
      if (data.deviceId !== user?.deviceId) {
        console.log('Ignoring fall detection for different device');
        return;
      }
      setLastUpdate('Phát hiện té ngã lúc: ' + new Date().toLocaleTimeString());
      
      if (data.location?.latitude && data.location?.longitude) {
        setFallLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          timestamp: data.timestamp
        });
      }

      Alert.alert(
        '🚨 Phát hiện té ngã!',
        `${data.message}\n\nVị trí: ${data.location?.latitude}, ${data.location?.longitude}\nThời gian: ${data.timestamp}`,
        [
          {
            text: 'Xem vị trí',
            onPress: () => setShowMap(true),
            style: 'default',
          },
          {
            text: 'Đóng',
            style: 'cancel',
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

    return () => {
      socket.disconnect();
    };
  }, [user?.deviceId]); // Thêm user.deviceId vào dependencies

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
        {fallLocation && (
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => setShowMap(true)}
          >
            <Text style={styles.mapButtonText}>Xem vị trí té ngã</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showMap}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowMap(false)}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
          
          {fallLocation && (
            <WebView
              source={{ 
                html: getMapHTML(fallLocation.latitude, fallLocation.longitude)
              }}
              style={styles.map}
            />
          )}
        </View>
      </Modal>
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
  mapButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center'
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  map: {
    flex: 1
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500'
  }
});