import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import ScreenHeader from '../components/ScreenHeader';
import MenuItemCard from './components/MenuItemCard';
import CategoryFilter from './components/CategoryFilter';
import { MenuItem, mockMenuItems } from '@/utils/menuHelpers';

export default function MenuScreen() {
  const [items, setItems] = useState<MenuItem[]>(mockMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter items by selected category
  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real app, you would fetch from an API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleToggleAvailability = (id: string, newValue: boolean) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, available: newValue } : item))
    );
  };

  const handleEditPress = (item: MenuItem) => {
    // Navigate to edit screen with the item data
    router.push({
      pathname: '/chef-admin/menu/edit',
      params: { id: item.id }
    });
  };

  const handleDeletePress = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this menu item? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setItems(items.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const handleAddNewItem = () => {
    // Navigate to edit screen with no item data (for creating new item)
    router.push('/chef-admin/menu/edit');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScreenHeader
        title="Menu"
        subtitle="Manage your menu items"
        showBackButton={true}
        onBackPress={() => router.push('/chef-admin/dashboard/dashboard')}
        rightComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddNewItem}>
            <MaterialIcons name="add" size={wp('6%')} color="#fff" />
          </TouchableOpacity>
        }
      />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onToggleAvailability={handleToggleAvailability}
            onEditPress={handleEditPress}
            onDeletePress={handleDeletePress}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="restaurant-menu" size={wp('15%')} color="#ccc" />
            <Text style={styles.emptyText}>No menu items found</Text>
            <Text style={styles.emptySubtext}>
              {selectedCategory
                ? `You don't have any items in this category`
                : `Your menu is empty. Add some delicious dishes!`}
            </Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={handleAddNewItem}>
              <Text style={styles.addFirstButtonText}>Add Your First Item</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: hp('5%'),
  },
  addButton: {
    backgroundColor: '#FF4B3E',
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: wp('5%'),
    paddingBottom: hp('10%'),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('10%'),
  },
  emptyText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('4.5%'),
    color: '#333',
    marginTop: hp('2%'),
  },
  emptySubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3.5%'),
    color: '#666',
    marginTop: hp('1%'),
    marginBottom: hp('3%'),
    textAlign: 'center',
    paddingHorizontal: wp('10%'),
  },
  addFirstButton: {
    backgroundColor: '#FF4B3E',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('3%'),
  },
  addFirstButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: wp('3.5%'),
    color: '#fff',
  },
});