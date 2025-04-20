import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../_layout';

export default function ChartScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [fallHistory, setFallHistory] = useState<any[]>([]);
  const [chartData, setChartData] = useState({
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2
      }
    ]
  });
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchData = async () => {
    if (!user?.deviceId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://detection-fall-backend-production.up.railway.app/api/fall-detection?deviceId=${user.deviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      setFallHistory(data.data || []);
      
      // Process data for statistics
      processChartData(data.data || []);
    } catch (error) {
      console.error('Error fetching fall history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.deviceId]);

  useEffect(() => {
    // Update chart data when period changes
    processChartData(fallHistory);
  }, [selectedPeriod, fallHistory]);

  const handleReset = () => {
    setChartData({
      labels: selectedPeriod === 'week' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
      datasets: [
        {
          data: selectedPeriod === 'week' ? [0, 0, 0, 0, 0, 0, 0] : [0, 0, 0, 0],
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2
        }
      ]
    });
    setWeeklyCount(0);
    setMonthlyCount(0);
    fetchData();
  };

  const processChartData = (data: any[]) => {
    if (!data || data.length === 0) return;

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate week start date (Monday of current week)
    const currentWeekStart = new Date(now);
    const dayOfWeek = now.getDay() || 7; // Convert Sunday (0) to 7
    currentWeekStart.setDate(currentDay - dayOfWeek + 1); // Set to Monday
    currentWeekStart.setHours(0, 0, 0, 0);

    // Count weekly falls
    const weeklyCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
    let weeklyTotal = 0;
    let monthlyTotal = 0;

    data.forEach(fall => {
      const fallDate = new Date(fall.timestamp);
      
      // Check if in current month
      if (fallDate.getMonth() === currentMonth && fallDate.getFullYear() === currentYear) {
        monthlyTotal++;
        
        // Check if in current week
        if (fallDate >= currentWeekStart) {
          weeklyTotal++;
          
          // Determine day of week (0 = Monday, 6 = Sunday)
          const dayIndex = (fallDate.getDay() + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0
          weeklyCounts[dayIndex]++;
        }
      }
    });

    setWeeklyCount(weeklyTotal);
    setMonthlyCount(monthlyTotal);

    if (selectedPeriod === 'week') {
      setChartData({
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        datasets: [
          {
            data: weeklyCounts,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            strokeWidth: 2
          }
        ]
      });
    } else {
      // For monthly view, we'll divide the month into weeks for better readability
      // Week 1: days 1-7, Week 2: days 8-14, Week 3: days 15-21, Week 4: days 22-31
      const weeksInMonth = [0, 0, 0, 0]; // 4 weeks
      
      data.forEach(fall => {
        const fallDate = new Date(fall.timestamp);
        if (fallDate.getMonth() === currentMonth && fallDate.getFullYear() === currentYear) {
          const day = fallDate.getDate();
          if (day <= 7) weeksInMonth[0]++;
          else if (day <= 14) weeksInMonth[1]++;
          else if (day <= 21) weeksInMonth[2]++;
          else weeksInMonth[3]++;
        }
      });
      
      setChartData({
        labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
        datasets: [
          {
            data: weeksInMonth,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            strokeWidth: 2
          }
        ]
      });
    }
  };

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
            <Text style={styles.summaryNumber}>{weeklyCount}</Text>
            <Text style={styles.summaryLabel}>Tuần này</Text>
          </View>
          <View style={styles.summaryCard}>
            <FontAwesome name="clock-o" size={24} color="#4CAF50" />
            <Text style={styles.summaryNumber}>{monthlyCount}</Text>
            <Text style={styles.summaryLabel}>Tháng này</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesome name="refresh" size={16} color="#fff" />
              {/* <Text style={styles.resetButtonText}></Text> */}
            </>
          )}
        </TouchableOpacity>
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
            data={chartData}
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
          {selectedPeriod === 'month' && (
            <View style={styles.legendContainer}>
              <Text style={styles.legendText}>Tuần 1: ngày 1-7</Text>
              <Text style={styles.legendText}>Tuần 2: ngày 8-14</Text>
              <Text style={styles.legendText}>Tuần 3: ngày 15-21</Text>
              <Text style={styles.legendText}>Tuần 4: ngày 22-31</Text>
            </View>
          )}
        </View>
      </View>
      <View>
        
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Lịch sử té ngã</Text>
        {fallHistory && fallHistory.length > 0 ? fallHistory.map((fall) => (
          <View key={fall._id} style={styles.historyCard}>
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
        )) : (
          <Text style={{ textAlign: 'center', color: '#666' }}>
            Không có dữ liệu té ngã nào
          </Text>
        )}
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
    position: 'relative',
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
  resetButton: {
    position: 'absolute',
    top: 60,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
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
  legendContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
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