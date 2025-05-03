import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/services/firebase';

export interface ChefProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  cuisine?: string;
  phone?: string;
  address?: string;
  photoURL?: string | null;
  rating?: number;
}

/**
 * Fetches profile data for a chef from Firestore
 * @param userId The user ID of the chef
 * @returns Promise resolving to chef profile data
 */
export const fetchChefProfile = async (userId: string): Promise<ChefProfile | null> => {
  try {
    const profileRef = doc(db, 'chefProfiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return { id: userId, ...profileSnap.data() } as ChefProfile;
    } else {
      // Profile doesn't exist yet in Firestore, but we have the user
      return null;
    }
  } catch (error) {
    console.error('Error fetching chef profile:', error);
    throw error;
  }
};

/**
 * Updates a chef's profile information in Firestore
 * @param userId The user ID of the chef
 * @param profileData The profile data to update
 * @returns Promise that resolves when the update is complete
 */
export const updateChefProfile = async (
  userId: string,
  profileData: Partial<ChefProfile>
): Promise<void> => {
  try {
    const profileRef = doc(db, 'chefProfiles', userId);
    
    // Check if profile document exists
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      // Update existing document
      await updateDoc(profileRef, {
        ...profileData,
        updatedAt: new Date()
      });
    } else {
      // Create new document
      await setDoc(profileRef, {
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating chef profile:', error);
    throw error;
  }
};

/**
 * Uploads a profile photo for a chef to Firebase Storage
 * @param userId The user ID of the chef
 * @param photoUri The local URI of the photo to upload
 * @returns Promise resolving to the uploaded photo URL
 */
export const uploadProfilePhoto = async (
  userId: string,
  photoUri: string
): Promise<string> => {
  try {
    // First, fetch the image as a blob
    const response = await fetch(photoUri);
    const blob = await response.blob();
    
    // Create a reference to storage
    const storageRef = ref(storage, `profilePhotos/${userId}/profile.jpg`);
    
    // Upload the blob
    await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};