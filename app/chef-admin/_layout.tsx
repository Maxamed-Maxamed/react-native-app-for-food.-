import { Stack } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

export default function ChefAdminLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

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
        name="signup"
        options={{
          title: "Chef Signup",
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
      {/* Orders module screens */}
      <Stack.Screen
        name="orders/index"
        options={{
          title: "Orders",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="orders/[id]"
        options={{
          title: "Order Details",
          headerShown: false,
        }}
      />
      {/* Menu module screens */}
      <Stack.Screen
        name="menu/index"
        options={{
          title: "Menu",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="menu/edit"
        options={{
          title: "Edit Menu Item",
          headerShown: false,
        }}
      />
    </Stack>
  );
}