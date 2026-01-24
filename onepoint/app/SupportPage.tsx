import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform, // Added missing import
} from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';

// Configuration
const WHATSAPP_NUMBER = '+255746297197';
const APP_VERSION = '1.2.0';

const SupportPage = () => {
  const handleWhatsApp = async () => {
    // 1. Define the message to be sent
    const msg = 'Hello Support Team, I need help with your app.';
    
    // 2. Prepare Debug Info
    const debugInfo = `
--- Debug Info ---
App Version: ${APP_VERSION}
Device: ${Device.modelName || 'Unknown'}
OS: ${Platform.OS} ${Device.osVersion || ''}`;

    // 3. Combine and Encode
    const fullText = `${msg}${debugInfo}`;
    const encodedText = encodeURIComponent(fullText);

    // 4. Construct URL (Use the variable name defined above)
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      
      if (!canOpen) {
        Alert.alert(
          'WhatsApp Not Available',
          'Please install WhatsApp to contact support directly from the app.'
        );
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while trying to open WhatsApp.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="help-circle-outline" size={64} color="#25D366" />

        <Text style={styles.title}>Need Help?</Text>
        <Text style={styles.subtitle}>
          Our support team is available on WhatsApp and ready to assist you.
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleWhatsApp}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          <Text style={styles.buttonText}>Chat on WhatsApp</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Response time is usually within a few minutes.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SupportPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    marginVertical: 15,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: '#888',
  },
});
