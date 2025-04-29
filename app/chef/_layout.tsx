import { Stack } from 'expo-router';
import { hide } from 'expo-router/build/utils/splash';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  return (
    <Stack>
      {/* <Stack.Screen name="[id]" options={{headerShown: true}}  /> */}
      <Stack.Screen
        name="[id]"
        options={{
          // title: `Chef`, 
          headerShown: false,
        }}
      />
      
    </Stack>
  );
}