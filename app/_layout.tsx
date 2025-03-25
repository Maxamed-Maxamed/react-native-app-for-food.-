import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import 'react-native-screens';
import React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { auth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Update the useEffect block
  useEffect(() => {
      if (fontsLoaded) {
          SplashScreen.hideAsync();
      }
  
      const initializeAuth = async () => {
          await auth.authStateReady( ) ; // Use the method on auth instance
          const unsubscribe = onAuthStateChanged(auth, (user) => {
              if (user) {
                  router.replace('/(tabs)/home');
              } else {
                  router.replace('/login');
              }
          });
          return unsubscribe;
      };
  
      const unsubscribePromise = initializeAuth();
      
      return () => {
          unsubscribePromise.then(unsubscribe => unsubscribe());
      };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="welcomepage"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} /> 
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

       
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
