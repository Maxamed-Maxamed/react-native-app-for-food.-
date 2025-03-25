import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';

interface CategoryCardProps {
  title: string;
  description: string;
  image: ImageSourcePropType;
  onPress: () => void;
}

const CategoryCard = ({ title, description, image, onPress }: CategoryCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 100,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
    color: '#333',
  },
  description: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    lineHeight: 16,
  },
  imageContainer: {
    width: 80,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
});

export default CategoryCard;