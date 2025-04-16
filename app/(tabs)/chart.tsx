import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome } from '@expo/vector-icons';

// Mock data cho biểu đồ và lịch sử té ngã
const mockFallData = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [
    {
      data: [2, 1, 0, 3, 1, 0, 1],
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2
    }
  ]
};

const mockFallHistory = [
  {
    id: '1',
    timestamp: '2025-04-15 09:30:00',
    location: { latitude: 10.762622, longitude: 106.660172 },
    deviceId: 'device-001'
  },
  {
    id: '2',
    timestamp: '2025-04-14 15:45:00',
    location: { latitude: 10.762700, longitude: 106.660200 },
    deviceId: 'device-001'
  },
];

export default function ChartScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống kê té ngã</Text>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <FontAwesome name="calendar" size={24} color="#2196F3" />
            <Text style={styles.summaryNumber}>8</Text>
            <Text style={styles.summaryLabel}>Tuần này</Text>
          </View>
          <View style={styles.summaryCard}>
            <FontAwesome name="clock-o" size={24} color="#4CAF50" />
            <Text style={styles.summaryNumber}>23</Text>
            <Text style={styles.summaryLabel}>Tháng này</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartSection}>
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'week' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'week' && styles.selectedPeriodText]}>
              Tuần
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'month' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'month' && styles.selectedPeriodText]}>
              Tháng
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          <LineChart
            data={mockFallData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#2196F3'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Lịch sử té ngã</Text>
        {mockFallHistory.map((fall) => (
          <View key={fall.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View style={styles.timeContainer}>
                <FontAwesome name="clock-o" size={16} color="#666" />
                <Text style={styles.timestamp}> {formatDate(fall.timestamp)}</Text>
              </View>
              <View style={styles.deviceContainer}>
                <FontAwesome name="mobile" size={16} color="#666" />
                <Text style={styles.deviceId}> {fall.deviceId}</Text>
              </View>
            </View>
            <View style={styles.locationContainer}>
              <FontAwesome name="map-marker" size={16} color="#666" />
              <Text style={styles.location}>
                {` ${fall.location.latitude.toFixed(6)}, ${fall.location.longitude.toFixed(6)}`}
              </Text>
            </View>
          </View>
        ))}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '40%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  chartSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedPeriod: {
    backgroundColor: '#2196F3',
  },
  periodText: {
    color: '#666',
    fontSize: 16,
  },
  selectedPeriodText: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  historySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 14,
    color: '#333',
  },
  deviceId: {
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
});
