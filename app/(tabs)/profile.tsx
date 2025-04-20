import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../_layout';

type IconName = 'user' | 'calendar' | 'venus-mars' | 'phone' | 'map-marker' |
                'heartbeat' | 'user-circle' | 'users' | 'edit' | 'check' | 'sign-out' |
                'tablet' | 'mobile-phone';

const API_URL = 'https://detection-fall-backend-production.up.railway.app/api';

interface ApiError {
  message: string;
}

interface UserProfile {
  avatar?: string;
  fullName: string;
  age: number | null;
  sex: string;
  address: string;
  hidden_disease: string;
  fullNameEmergency: string;
  phoneEmergency: string;
  emailEmergency: string;
  deviceId: string;
}

export default function ProfileScreen() {
  const { logout, user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=2196F3&color=fff`;
  
  const [profile, setProfile] = useState<UserProfile>({
    avatar: defaultAvatar,
    fullName: user?.fullName || '',
    age: null,
    sex: '',
    address: '',
    hidden_disease: '',
    phoneEmergency: user?.phoneEmergency || '',
    deviceId: user?.deviceId || '',
    fullNameEmergency: '',
    emailEmergency: '',
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    if (user?.phoneEmergency) { 
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${user?.phoneEmergency}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('message' in data ? data.message : 'Lỗi tải thông tin');
      }
    
      setProfile(data.user);
      setEditedProfile(data.user);
    } catch (error) {
      console.error('Fetch profile error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    }
  };

  const handleSave = async () => {
    if (!editedProfile.fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ họ tên');
      return;
    }

    try {
      // Đảm bảo deviceId và phoneEmergency không thay đổi
      const dataToUpdate = {
        ...editedProfile,
        deviceId: profile.deviceId, // Sử dụng giá trị ban đầu
        phoneEmergency: profile.phoneEmergency // Sử dụng giá trị ban đầu
      };

      const response = await fetch(`${API_URL}/users/${user?.phoneEmergency}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('message' in data ? data.message : 'Lỗi cập nhật thông tin');
      }

      setProfile(data.user);
      setIsEditing(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin');
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin người dùng');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          onPress: logout,
          style: 'destructive',
        },
      ]
    );
  };

  const renderInfoCard = (icon: IconName, label: string, value: string, isEditable: boolean = true) => (
    <View style={styles.infoCard}>
      <FontAwesome name={icon} size={20} color="#2196F3" style={styles.cardIcon} />
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>{label}</Text>
        {isEditing && isEditable ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => {
              const field = label.toLowerCase().replace(/ /g, '');
              let fieldName: keyof UserProfile;
              
              // Map labels to field names
              const fieldMap: Record<string, keyof UserProfile> = {
                'họvàtên': 'fullName',
                'tuổi': 'age',
                'giớitính': 'sex',
                'địachỉ': 'address',
                'bệnhnền': 'hidden_disease',
                'họtên': 'fullNameEmergency',
                'emailnhậntinbáo': 'emailEmergency'
                // Đã loại bỏ deviceId và phoneEmergency khỏi danh sách có thể chỉnh sửa
              };

              fieldName = fieldMap[field];
              if (!fieldName) return;

              setEditedProfile(prev => ({
                ...prev,
                [fieldName]: fieldName === 'age' && text ? Number(text) : text
              }));
            }}
            placeholder={`Nhập ${label.toLowerCase()}`}
            placeholderTextColor="#999"
          />
        ) : (
          <Text style={[styles.cardValue, !isEditable && isEditing && styles.disabledValue]}>
            {value}
            {!isEditable && isEditing && (
              <Text style={styles.lockedText}> (không thể thay đổi)</Text>
            )}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: profile.avatar }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile.fullName}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              <FontAwesome 
                name={isEditing ? "check" : "edit"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.editButtonText}>
                {isEditing ? ' Lưu' : ' Chỉnh sửa'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <FontAwesome name="sign-out" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}> Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        {renderInfoCard('user', 'Họ và tên', editedProfile.fullName)}
        {renderInfoCard('calendar', 'Tuổi', editedProfile.age?.toString() || '')}
        {renderInfoCard('venus-mars', 'Giới tính', editedProfile.sex)}
        {renderInfoCard('map-marker', 'Địa chỉ', editedProfile.address)}
        {renderInfoCard('heartbeat', 'Bệnh nền', editedProfile.hidden_disease)}
        {renderInfoCard('mobile-phone', 'Máy đo', editedProfile.deviceId, false)} {/* Không cho phép chỉnh sửa */}

        <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
        {renderInfoCard('user-circle', 'Họ tên', editedProfile.fullNameEmergency)}
        {renderInfoCard('phone', 'Số điện thoại khẩn cấp', editedProfile.phoneEmergency, false)} {/* Không cho phép chỉnh sửa */}
        {renderInfoCard('users', 'Email nhận tin báo', editedProfile.emailEmergency)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: '#333',
  },
  disabledValue: {
    color: '#777',
  },
  lockedText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#999',
  },
  input: {
    fontSize: 16,
    color: '#333',
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
  },
});