import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const screenWidth = Dimensions.get('window').width - wp('18%');

interface AgeGroup {
  label: string;
  percentage: number;
}

interface Location {
  name: string;
  value: number;
}

interface DemographicsProps {
  data: {
    ageGroups: AgeGroup[];
    locations: Location[];
  };
}

export default function Demographics({ data }: DemographicsProps) {
  // Colors for pie charts
  const colors = ['#FF4B3E', '#FF8C42', '#FFBC3B', '#76C893', '#14746F'];

  // Prepare age groups data for pie chart
  const ageData = data.ageGroups.map((item, index) => ({
    name: item.label,
    population: item.percentage,
    color: colors[index % colors.length],
    legendFontColor: '#666',
    legendFontSize: 12,
  }));

  // Prepare locations data for pie chart
  const locationData = data.locations.map((item, index) => ({
    name: item.name,
    population: item.value,
    color: colors[index % colors.length],
    legendFontColor: '#666',
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Customer Age Groups</Text>
        <PieChart
          data={ageData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute={false}
          style={styles.chart}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Customer Locations</Text>
        <PieChart
          data={locationData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute={false}
          style={styles.chart}
        />
      </View>

      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Key Insights</Text>
        <View style={styles.insightItem}>
          <View style={styles.insightDot} />
          <Text style={styles.insightText}>
            {data.ageGroups.sort((a, b) => b.percentage - a.percentage)[0].label} is your largest age group.
          </Text>
        </View>
        <View style={styles.insightItem}>
          <View style={styles.insightDot} />
          <Text style={styles.insightText}>
            Most of your customers come from {data.locations.sort((a, b) => b.value - a.value)[0].name}.
          </Text>
        </View>
        <View style={styles.insightItem}>
          <View style={styles.insightDot} />
          <Text style={styles.insightText}>
            Consider targeted marketing for {data.ageGroups.sort((a, b) => a.percentage - b.percentage)[0].label} age group to increase their representation.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('2%'),
  },
  section: {
    marginBottom: hp('3%'),
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#333',
    marginBottom: hp('1%'),
  },
  chart: {
    marginVertical: hp('1%'),
  },
  insightsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginTop: hp('1%'),
  },
  insightsTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#333',
    marginBottom: hp('1.5%'),
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  insightDot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: '#FF4B3E',
    marginRight: wp('2%'),
  },
  insightText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
    flex: 1,
  },
});