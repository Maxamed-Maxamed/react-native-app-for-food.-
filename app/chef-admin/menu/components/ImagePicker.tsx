import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface ImagePickerProps {
  image: any;
  onImageSelected: (image: any) => void;
}

export default function ImagePicker({ image, onImageSelected }: ImagePickerProps) {
  const handleSelectImage = () => {
    // In a real app, this would use Expo ImagePicker
    // For now, we'll use a mock with a simple alert
    Alert.alert(
      'Select Image Source',
      'Choose where to select an image from:',
      [
        {
          text: 'Camera',
          onPress: () => mockSelectImage('camera'),
        },
        {
          text: 'Gallery',
          onPress: () => mockSelectImage('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const mockSelectImage = (source: 'camera' | 'gallery') => {
    // In a real app, this would actually pick an image
    // For now, we'll rotate between some sample images
    const sampleImages = [
      require('@/assets/images/dish1.png'),
      require('@/assets/images/dish2.png'),
      require('@/assets/images/dish3.png'),
    ];
    
    // Select a random image that's different from current one
    let newImage;
    do {
      newImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    } while (newImage === image && sampleImages.length > 1);
    
    onImageSelected(newImage);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleSelectImage}>
      {image ? (
        <Image source={image} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <MaterialIcons name="add-photo-alternate" size={wp('10%')} color="#999" />
          <Text style={styles.placeholderText}>Add Photo</Text>
        </View>
      )}
      <View style={styles.editButton}>
        <MaterialIcons name="edit" size={wp('4%')} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: wp('3%'),
  },
  placeholderText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: wp('3%'),
    color: '#999',
    marginTop: hp('0.5%'),
  },
  editButton: {
    position: 'absolute',
    bottom: wp('1%'),
    right: wp('1%'),
    backgroundColor: '#FF4B3E',
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('3.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});