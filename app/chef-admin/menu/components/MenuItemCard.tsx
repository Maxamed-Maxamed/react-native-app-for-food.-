import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { MenuItem, formatPrice } from '@/utils/menuHelpers';

interface MenuItemCardProps {
  item: MenuItem;
  onToggleAvailability: (id: string, newValue: boolean) => void;
  onEditPress: (item: MenuItem) => void;
  onDeletePress: (id: string) => void;
}

export default function MenuItemCard({
  item,
  onToggleAvailability,
  onEditPress,
  onDeletePress,
}: MenuItemCardProps) {
  const handleToggleSwitch = () => {
    onToggleAvailability(item.id, !item.available);
  };

  return (
    <View style={[styles.container, !item.available && styles.unavailableItem]}>
      <Image source={item.image} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category.replace('-', ' ')}</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        {item.dietary && item.dietary.length > 0 && (
          <View style={styles.dietaryContainer}>
            {item.dietary.map((diet) => (
              <View key={diet} style={styles.dietaryBadge}>
                <Text style={styles.dietaryText}>{diet}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.price}>${formatPrice(item.price)}</Text>
          
          <View style={styles.actions}>
            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityLabel}>
                {item.available ? 'Available' : 'Unavailable'}
              </Text>
              <Switch
                trackColor={{ false: '#E0E0E0', true: '#FFD7D5' }}
                thumbColor={item.available ? '#FF4B3E' : '#9E9E9E'}
                onValueChange={handleToggleSwitch}
                value={item.available}
              />
            </View>
            
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onEditPress(item)}
            >
              <MaterialIcons name="edit" size={wp('5%')} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onDeletePress(item.id)}
            >
              <MaterialIcons name="delete" size={wp('5%')} color="#FF4B3E" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  unavailableItem: {
    opacity: 0.7,
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: wp('25%'),
    height: wp('25%'),
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: wp('3%'),
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  name: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#333',
    flex: 1,
    marginRight: wp('2%'),
  },
  categoryBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('2%'),
  },
  categoryText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: wp('2.8%'),
    color: '#0088FF',
    textTransform: 'capitalize',
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.2%'),
    color: '#666',
    marginBottom: hp('1%'),
    flex: 1,
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp('1%'),
  },
  dietaryBadge: {
    backgroundColor: '#F0FFE8',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.2%'),
    borderRadius: wp('2%'),
    marginRight: wp('1%'),
    marginBottom: hp('0.5%'),
  },
  dietaryText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('2.8%'),
    color: '#4CAF50',
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4%'),
    color: '#FF4B3E',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  availabilityLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3%'),
    color: '#666',
    marginRight: wp('1%'),
  },
  iconButton: {
    padding: wp('1%'),
    marginLeft: wp('1%'),
  },
});