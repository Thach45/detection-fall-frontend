import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, Button, Dialog, Portal, TextInput, List, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { AuthContext } from '../_layout';

interface MedicationReminder {
  _id: string;
  medicineName: string;
  schedule: { hours: number; minutes: number }[];
  isActive: boolean;
}
const URL ="https://detection-fall-backend-production.up.railway.app"
export default function MedicineScreen() {
  const [visible, setVisible] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [schedules, setSchedules] = useState<{ hours: number; minutes: number }[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      if (!user?._id) return;

      const response = await fetch(`${URL}/api/medication-reminders/user/${user._id}`);
      const data = await response.json();
      
      if (data.success) {
        setReminders(data.data);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách nhắc nhở');
    }
  };

  const showDialog = () => setVisible(true);
  const hideDialog = () => {
    setVisible(false);
    setMedicineName('');
    setSchedules([]);
  };

  const showTimePickerDialog = () => {
    setShowTimePicker(true);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setSelectedTime(selectedDate);
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      setSchedules([...schedules, { hours, minutes }]);
    }
  };

  const removeTime = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const saveReminder = async () => {
    if (!medicineName || schedules.length === 0 || !user?._id) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch(`${URL}/api/medication-reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          deviceId: user.deviceId,
          medicineName,
          schedule: schedules,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Thành công', 'Đã tạo nhắc nhở uống thuốc');
        hideDialog();
        loadReminders();
      } else {
        Alert.alert('Lỗi', data.message);
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Lỗi', 'Không thể lưu nhắc nhở');
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const response = await fetch(`${URL}/api/medication-reminders/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        loadReminders();
      } else {
        Alert.alert('Lỗi', data.message);
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Lỗi', 'Không thể xóa nhắc nhở');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Button 
        mode="contained" 
        onPress={showDialog}
        style={styles.addButton}
      >
        Thêm lịch uống thuốc
      </Button>

      {reminders.map(reminder => (
        <Card key={reminder._id} style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">{reminder.medicineName}</Text>
            <View style={styles.scheduleList}>
              {reminder.schedule.map((time, index) => (
                <Text key={index} variant="bodyMedium">
                  {format(new Date().setHours(time.hours, time.minutes), 'HH:mm')}
                </Text>
              ))}
            </View>
            <View style={styles.cardActions}>
              <Button 
                mode="outlined" 
                onPress={() => deleteReminder(reminder._id)}
                textColor="red"
              >
                Xóa
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Thêm lịch uống thuốc</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Tên thuốc"
              value={medicineName}
              onChangeText={text => setMedicineName(text)}
              style={styles.input}
            />
            
            <Text variant="titleMedium" style={styles.timeListTitle}>
              Thời gian uống thuốc:
            </Text>
            
            {schedules.map((time, index) => (
              <List.Item
                key={index}
                title={format(new Date().setHours(time.hours, time.minutes), 'HH:mm')}
                right={props => (
                  <TouchableOpacity onPress={() => removeTime(index)}>
                    <List.Icon {...props} icon="close" />
                  </TouchableOpacity>
                )}
              />
            ))}

            <Button 
              mode="outlined" 
              onPress={showTimePickerDialog}
              style={styles.timeButton}
            >
              Thêm thời gian
            </Button>

            {showTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                testID="dateTimePickerAndroid"
                value={selectedTime}
                mode="time"
                is24Hour={true}
                onChange={onTimeChange}
                display="default"
              />
            )}
            {showTimePicker && Platform.OS === 'ios' && (
              <DateTimePicker
                testID="dateTimePickerIOS"
                value={selectedTime}
                mode="time"
                is24Hour={true}
                onChange={onTimeChange}
                display="spinner"
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Hủy</Button>
            <Button onPress={saveReminder}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
  },
  addButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  timeListTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  timeButton: {
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
  },
  scheduleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});