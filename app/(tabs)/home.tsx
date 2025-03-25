import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { auth } from '@/services/firebase';
import { router } from 'expo-router';

export default function HomeScreen() {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text>home</Text>
    </View>
  );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})