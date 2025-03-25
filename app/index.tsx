import { Redirect } from 'expo-router';
import { auth } from '@/services/firebase';

export default function Index() {
  // If user is logged in, redirect to home, otherwise to login
  return auth.currentUser ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/login" />;
}
