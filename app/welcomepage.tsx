import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomePage() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('@/assets/images/logo.png') } // Replace with your actual image path
        style={styles.logo}
        resizeMode="cover"
      />

      {/* Tagline */}
      <Text style={styles.tagline} >Enjoy fresh food delivered right to your door.</Text>

      {/* Get Started Button */}
      <Link href="/signup" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 30,
    resizeMode: 'contain', // Ensures it fits nicely
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    color: '#333',
    marginHorizontal: 40,
    marginBottom: 50,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#000080',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
});
