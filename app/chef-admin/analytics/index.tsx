import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useAuth } from '@/context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import SalesChart from './components/SalesChart';
import PopularItems from './components/PopularItems';
import Demographics from './components/Demographics';

const screenWidth = Dimensions.get('window').width;

// Define interface for the analytics data structure
interface AnalyticsData {
  salesData: {
    lastSixMonths: { month: string; sales: number }[];
    weeklyData: { day: string; sales: number }[];
  };
  popularItems: { name: string; orders: number; revenue: number }[];
  demographics: {
    ageGroups: { label: string; percentage: number }[];
    locations: { name: string; value: number }[];
  };
}

export default function AnalyticsDashboardScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  // Initialize with proper typing
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Check if user is authenticated and has the right role
    if (!user || user.role !== 'chef') {
      router.replace('/chef-admin/login');
      return;
    }

    // In a real app, fetch analytics data from your backend
    // For now, we're using mock data
    setTimeout(() => {
      setAnalyticsData(getMockAnalyticsData());
      setIsLoading(false);
    }, 1000);
  }, [user]); // Add user as a dependency

  // Render loading state until we know if user is authenticated
  if (!user || user.role !== 'chef') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#FF4B3E" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Analytics Dashboard"
        showBackButton={true}
        onBackPress={() => router.push('/chef-admin/dashboard/dashboard')}
      />

      <ScrollView style={styles.content}>
        {isLoading || !analyticsData ? (
          <ActivityIndicator size="large" color="#FF4B3E" style={styles.loader} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Sales Overview</Text>
            <View style={styles.chartContainer}>
              <SalesChart data={analyticsData.salesData} />
            </View>

            <Text style={styles.sectionTitle}>Popular Menu Items</Text>
            <View style={styles.chartContainer}>
              <PopularItems data={analyticsData.popularItems} />
            </View>

            <Text style={styles.sectionTitle}>Customer Demographics</Text>
            <View style={styles.chartContainer}>
              <Demographics data={analyticsData.demographics} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Type the return value of the mock function
const getMockAnalyticsData = (): AnalyticsData => {
  return {
    salesData: {
      lastSixMonths: [
        { month: 'Jan', sales: 1200 },
        { month: 'Feb', sales: 1800 },
        { month: 'Mar', sales: 1600 },
        { month: 'Apr', sales: 2400 },
        { month: 'May', sales: 2200 },
        { month: 'Jun', sales: 3000 },
      ],
      weeklyData: [
        { day: 'Mon', sales: 300 },
        { day: 'Tue', sales: 450 },
        { day: 'Wed', sales: 380 },
        { day: 'Thu', sales: 620 },
        { day: 'Fri', sales: 750 },
        { day: 'Sat', sales: 890 },
        { day: 'Sun', sales: 700 },
      ]
    },
    popularItems: [
      { name: 'Pasta Carbonara', orders: 45, revenue: 675 },
      { name: 'Margherita Pizza', orders: 38, revenue: 532 },
      { name: 'Tiramisu', orders: 32, revenue: 288 },
      { name: 'Lasagna', orders: 28, revenue: 420 },
      { name: 'Risotto', orders: 25, revenue: 375 },
    ],
    demographics: {
      ageGroups: [
        { label: '18-24', percentage: 15 },
        { label: '25-34', percentage: 30 },
        { label: '35-44', percentage: 25 },
        { label: '45-54', percentage: 20 },
        { label: '55+', percentage: 10 },
      ],
      locations: [
        { name: 'Downtown', value: 40 },
        { name: 'Midtown', value: 25 },
        { name: 'Uptown', value: 20 },
        { name: 'Suburbs', value: 15 },
      ]
    }
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: hp('5%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
  },
  loader: {
    marginTop: hp('10%'),
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('5%'),
    color: '#333',
    marginTop: hp('3%'),
    marginBottom: hp('2%'),
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  }
});