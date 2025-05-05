import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useAuth } from '@/context/AuthContext';

export default function ChefDashboardScreen() {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/chef-admin/login');
    } else if (user.role !== 'chef') {
      Alert.alert(
        'Access Denied',
        'You must be logged in as a chef to access this area.',
        [
          {
            text: 'OK',
            onPress: () => {
              logout();
              router.replace('/');
            },
          },
        ]
      );
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            router.replace('/chef-admin/auth/login');
          },
        },
      ]
    );
  };

  const chef = {
    name: user?.name || 'Chef',
    image: require('@/assets/images/chef1.png'),
    earnings: 1240.5,
    pendingOrders: 3,
    completedOrders: 28,
    rating: 4.5,
  };

  if (!user || user.role !== 'chef') {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage your business</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialIcons name="logout" size={wp('6%')} color="#FF4B3E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Chef Profile Section */}
        <View style={styles.profileSection}>
          <Image source={chef.image} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Hello, {chef.name}</Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <MaterialIcons
                  key={i}
                  name={
                    i < Math.floor(chef.rating)
                      ? 'star'
                      : i === Math.floor(chef.rating) && chef.rating % 1 > 0
                      ? 'star-half'
                      : 'star-outline'
                  }
                  size={wp('4%')}
                  color="#FFB800"
                />
              ))}
              <Text style={styles.ratingText}> {chef.rating}</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, styles.earningsCard]}>
            <View style={styles.statsContent}>
              <Text style={styles.statsValue}>${chef.earnings.toFixed(2)}</Text>
              <Text style={styles.statsLabel}>Total Earnings</Text>
            </View>
            <MaterialIcons
              name="attach-money"
              size={wp('10%')}
              color="#FF4B3E"
              style={styles.statsIcon}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statsCard, styles.halfCard]}>
              <View style={styles.statsContent}>
                <Text style={styles.statsValue}>{chef.pendingOrders}</Text>
                <Text style={styles.statsLabel}>Pending Orders</Text>
              </View>
              <MaterialIcons
                name="access-time"
                size={wp('8%')}
                color="#FFB800"
                style={styles.statsIcon}
              />
            </View>

            <View style={[styles.statsCard, styles.halfCard]}>
              <View style={styles.statsContent}>
                <Text style={styles.statsValue}>{chef.completedOrders}</Text>
                <Text style={styles.statsLabel}>Completed</Text>
              </View>
              <MaterialIcons
                name="check-circle"
                size={wp('8%')}
                color="#4CAF50"
                style={styles.statsIcon}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/chef-admin/orders')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FFE8E7' }]}>
              <MaterialIcons name="receipt" size={wp('8%')} color="#FF4B3E" />
            </View>
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/chef-admin/menu')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E8F4FF' }]}>
              <MaterialIcons name="restaurant-menu" size={wp('8%')} color="#0088FF" />
            </View>
            <Text style={styles.actionText}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/chef-admin/profile')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#F0FFE8' }]}>
              <MaterialIcons name="person" size={wp('8%')} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/chef-admin/analytics')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FFF8E8' }]}>
              <MaterialIcons name="bar-chart" size={wp('8%')} color="#FFB800" />
            </View>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity - Placeholder for now */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.recentActivityCard}>
          <View style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <MaterialIcons name="shopping-bag" size={wp('5%')} color="#FF4B3E" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Order #1234</Text>
              <Text style={styles.activityTime}>10 minutes ago</Text>
            </View>
            <MaterialIcons name="chevron-right" size={wp('6%')} color="#999" />
          </View>

          <View style={styles.divider} />

          <View style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <MaterialIcons name="star" size={wp('5%')} color="#FFB800" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Rating (4.8★)</Text>
              <Text style={styles.activityTime}>1 hour ago</Text>
            </View>
            <MaterialIcons name="chevron-right" size={wp('6%')} color="#999" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: hp('5%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('5.5%'),
    color: '#333',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: wp('5%'),
    borderRadius: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    marginRight: wp('4%'),
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  statsContainer: {
    marginBottom: hp('3%'),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    marginBottom: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  earningsCard: {
    backgroundColor: '#fff',
    marginBottom: hp('2%'),
  },
  halfCard: {
    width: '48%',
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('5.5%'),
    color: '#333',
  },
  statsLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  statsIcon: {
    opacity: 0.8,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#333',
    marginBottom: hp('2%'),
    marginTop: hp('1%'),
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp('3%'),
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: wp('4%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  actionText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('3.5%'),
    color: '#333',
    marginTop: hp('1%'),
  },
  recentActivityCard: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('3%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
  },
  activityIconContainer: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#FFE8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('3.5%'),
    color: '#333',
  },
  activityTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3%'),
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: hp('1%'),
  },
});