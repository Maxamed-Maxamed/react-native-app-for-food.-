import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const screenWidth = Dimensions.get('window').width - wp('18%');

interface MenuItem {
  name: string;
  orders: number;
  revenue: number;
}

interface PopularItemsProps {
  data: MenuItem[];
}

export default function PopularItems({ data }: PopularItemsProps) {
  const [sortBy, setSortBy] = useState<'orders' | 'revenue'>('orders');

  // Sort data based on selected criteria
  const sortedData = [...data].sort((a, b) => b[sortBy] - a[sortBy]);

  // Prepare data for the chart
  const chartData = {
    labels: sortedData.map(item => item.name.split(' ')[0]), // Only show first word for brevity
    datasets: [
      {
        data: sortedData.map(item => item[sortBy]),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Most Popular Items</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              sortBy === 'orders' ? styles.activeToggle : null,
            ]}
            onPress={() => setSortBy('orders')}
          >
            <Text style={[
              styles.toggleText,
              sortBy === 'orders' ? styles.activeToggleText : null,
            ]}>By Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              sortBy === 'revenue' ? styles.activeToggle : null,
            ]}
            onPress={() => setSortBy('revenue')}
          >
            <Text style={[
              styles.toggleText,
              sortBy === 'revenue' ? styles.activeToggleText : null,
            ]}>By Revenue</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BarChart
        data={chartData}
        width={screenWidth}
        height={220}
        yAxisLabel={sortBy === 'revenue' ? "$" : ""}
        yAxisSuffix="" // Add this required prop
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 75, 62, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.7,
        }}
        style={styles.chart}
        fromZero
      />

      <Text style={styles.listTitle}>Details</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Menu Item</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Orders</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Revenue</Text>
      </View>
      {sortedData.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.orders}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>${item.revenue}</Text>
        </View>
      ))}
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
  chart: {
    marginVertical: hp('1%'),
    borderRadius: wp('3%'),
  },
  listTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#333',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: hp('1%'),
    marginBottom: hp('1%'),
  },
  tableHeaderText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('3.5%'),
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  tableCell: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
});