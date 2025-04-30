import { Stack } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function ChefAdminLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  SplashScreen.preventAutoHideAsync();
  

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Chef Login",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: false,
        }}
      />

        <Stack.Screen
        name="signup"
        options={{
          title: "Sign Up",
          headerShown: false,
        }}
      />
   
      
    </Stack>
  );
}