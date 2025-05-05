import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

export default function StartScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('@/assets/images/landing-bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.topSection}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>EasyEat</Text>
            <Text style={styles.tagline}>Delicious food at your doorstep</Text>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.questionText}>How are you using EasyEat?</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="person" size={wp('6%')} color="#FF4B3E" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>I'm a Customer</Text>
                  <Text style={styles.optionDescription}>Order delicious meals from local chefs</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={wp('6%')} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => router.push('/chef-admin/auth/login')}
            >
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="restaurant" size={wp('6%')} color="#FF4B3E" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>I'm a Chef</Text>
                  <Text style={styles.optionDescription}>Manage your menu and track orders</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={wp('6%')} color="#666" />
            </TouchableOpacity>

            <Text style={styles.footerText}>© 2025 EasyEat. All rights reserved.</Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF4B3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',

  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 75, 62.0, 0.8)',
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: hp('10%'),
  },
  logo: {
    width: wp('50.5%'),
    height: wp('50.5%'),
    marginBottom: hp('2%'),
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('8%'),
    color: 'white',
    marginBottom: hp('1%'),
  },
  tagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('4%'),
    color: '#f0f0f0',
    marginBottom: hp('2%'),
  },
  bottomSection: {
    backgroundColor: 'white',
    borderTopLeftRadius: wp('8%'),
    borderTopRightRadius: wp('8%'),
    padding: wp('6%'),
    paddingTop: wp('8%'),
    paddingBottom: hp('4%'),
  },
  questionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('5%'),
    color: '#333',
    marginBottom: hp('3%'),
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#FFF0EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#333',
  },
  optionDescription: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
  },
  footerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3%'),
    color: '#999',
    textAlign: 'center',
    marginTop: hp('3%'),
  },
});
