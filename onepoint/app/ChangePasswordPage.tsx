import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const GoogleAccountPasswordInfoPage = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="logo-google" size={72} color="#DB4437" />

        <Text style={styles.title}>No Password to Change</Text>

        <Text style={styles.description}>
          You signed up using your Google account. For security reasons,
          accounts created with Google do not have a separate password in this
          app.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#4A90E2" />
          <Text style={styles.infoText}>
            Your account security is managed directly by Google.
          </Text>
        </View>

        <Text style={styles.hint}>
          If you want to update your login security, you can change your
          password directly in your Google account settings.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Need help? Visit the Support page for assistance.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default GoogleAccountPasswordInfoPage;

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
    fontSize: 22,
    fontWeight: '700',
    marginTop: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  hint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 20,
  },
  button: {
    marginTop: 25,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 18,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

