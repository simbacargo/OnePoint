import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const WHATSAPP_NUMBER = '255746297197';
const DEFAULT_MESSAGE = 'Hello Support Team, I need help with your app.';

const SupportPage = () => {
  const handleWhatsApp = async () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      DEFAULT_MESSAGE
    )}`;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(
        'WhatsApp Not Available',
        'Please install WhatsApp to contact support.'
      );
      return;
    }

    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="help-circle-outline" size={64} color="#25D366" />

        <Text style={styles.title}>Need Help?</Text>
        <Text style={styles.subtitle}>
          Our support team is available on WhatsApp and ready to assist you.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleWhatsApp}>
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

