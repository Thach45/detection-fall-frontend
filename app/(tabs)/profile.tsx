import React, { useState, useContext } from 'react';
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
                'heartbeat' | 'user-circle' | 'users' | 'edit' | 'check' | 'sign-out';

interface UserProfile {
  avatar: string;
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  address: string;
  medicalConditions: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=2196F3&color=fff',
    fullName: 'Nguyễn Văn A',
    age: '65',
    gender: 'Nam',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    medicalConditions: 'Huyết áp cao, tiểu đường',
    emergencyContact: {
      name: 'Nguyễn Văn B',
      phone: '0987654321',
      relationship: 'Con trai',
    },
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    if (!editedProfile.fullName.trim() || !editedProfile.phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ họ tên và số điện thoại');
      return;
    }
    setProfile(editedProfile);
    setIsEditing(false);
    Alert.alert('Thành công', 'Đã cập nhật thông tin');
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

  const renderInfoCard = (icon: IconName, label: string, value: string) => (
    <View style={styles.infoCard}>
      <FontAwesome name={icon} size={20} color="#2196F3" style={styles.cardIcon} />
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => {
              const field = label.toLowerCase().replace(/ /g, '');
              if (field.includes('emergency')) {
                const emergencyField = field.replace('emergency', '').toLowerCase();
                setEditedProfile({
                  ...editedProfile,
                  emergencyContact: {
                    ...editedProfile.emergencyContact,
                    [emergencyField]: text,
                  },
                });
              } else {
                setEditedProfile({ ...editedProfile, [field]: text });
              }
            }}
            placeholder={`Nhập ${label.toLowerCase()}`}
            placeholderTextColor="#999"
          />
        ) : (
          <Text style={styles.cardValue}>{value}</Text>
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
        {renderInfoCard('calendar', 'Tuổi', editedProfile.age)}
        {renderInfoCard('venus-mars', 'Giới tính', editedProfile.gender)}
        {renderInfoCard('phone', 'Số điện thoại', editedProfile.phone)}
        {renderInfoCard('map-marker', 'Địa chỉ', editedProfile.address)}
        {renderInfoCard('heartbeat', 'Bệnh nền', editedProfile.medicalConditions)}

        <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
        {renderInfoCard('user-circle', 'Họ tên', editedProfile.emergencyContact.name)}
        {renderInfoCard('phone', 'Số điện thoại', editedProfile.emergencyContact.phone)}
        {renderInfoCard('users', 'Quan hệ', editedProfile.emergencyContact.relationship)}
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
  input: {
    fontSize: 16,
    color: '#333',
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
  },
});