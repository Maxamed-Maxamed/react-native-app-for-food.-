import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const screenWidth = Dimensions.get('window').width - wp('18%');

interface SalesDataPoint {
  month?: string;
  day?: string;
  sales: number;
}

interface SalesChartProps {
  data: {
    lastSixMonths: SalesDataPoint[];
    weeklyData: SalesDataPoint[];
  };
}

export default function SalesChart({ data }: SalesChartProps) {
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly');

  // Prepare data for the chart based on selected timeframe with proper filtering
  const chartData = {
    // Filter out any undefined values and ensure we only have strings
    labels: timeframe === 'monthly'
      ? data.lastSixMonths.map(item => item.month || "").filter(label => label !== "")
      : data.weeklyData.map(item => item.day || "").filter(label => label !== ""),
    datasets: [
      {
        data: timeframe === 'monthly'
          ? data.lastSixMonths.map(item => item.sales)
          : data.weeklyData.map(item => item.sales),
      },
    ],
  };

  // Calculate total sales
  const totalSales = timeframe === 'monthly'
    ? data.lastSixMonths.reduce((sum, item) => sum + item.sales, 0)
    : data.weeklyData.reduce((sum, item) => sum + item.sales, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Revenue</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              timeframe === 'weekly' ? styles.activeToggle : null,
            ]}
            onPress={() => setTimeframe('weekly')}
          >
            <Text style={[
              styles.toggleText,
              timeframe === 'weekly' ? styles.activeToggleText : null,
            ]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              timeframe === 'monthly' ? styles.activeToggle : null,
            ]}
            onPress={() => setTimeframe('monthly')}
          >
            <Text style={[
              styles.toggleText,
              timeframe === 'monthly' ? styles.activeToggleText : null,
            ]}>Monthly</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Sales</Text>
        <Text style={styles.totalValue}>${totalSales.toFixed(2)}</Text>
        <Text style={styles.periodLabel}>
          {timeframe === 'monthly' ? 'Last 6 months' : 'Last 7 days'}
        </Text>
      </View>

      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 75, 62, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#FF4B3E',
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('2%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: wp('2%'),
    overflow: 'hidden',
  },
  toggleButton: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
  },
  activeToggle: {
    backgroundColor: '#FF4B3E',
    borderRadius: wp('2%'),
  },
  toggleText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('3%'),
    color: '#666',
  },
  activeToggleText: {
    color: '#fff',
  },
  totalContainer: {
    marginBottom: hp('2%'),
  },
  totalLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  totalValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: wp('6%'),
    color: '#333',
    marginVertical: hp('0.5%'),
  },
  periodLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3%'),
    color: '#999',
  },
  chart: {
    marginVertical: hp('1%'),
    borderRadius: wp('3%'),
  },
});