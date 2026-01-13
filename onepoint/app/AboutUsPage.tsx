import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AboutUsPage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="information-circle-outline" size={72} color="#4A90E2" />
          <Text style={styles.title}>About Us</Text>
          <Text style={styles.subtitle}>
            Learn more about who we are and what drives us.
          </Text>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Who We Are</Text>
          <Text style={styles.text}>
            We are a technology-driven team focused on building reliable,
            user-friendly, and innovative mobile solutions. Our goal is to
            simplify everyday tasks and provide meaningful digital experiences
            that add real value to our users.
          </Text>
        </View>

        {/* Mission & Vision */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="rocket-outline" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.text}>
            To deliver high-quality digital products that are secure, efficient,
            and easy to use—while maintaining exceptional customer support.
          </Text>

          <View style={[styles.row, { marginTop: 15 }]}>
            <Ionicons name="eye-outline" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Our Vision</Text>
          </View>
          <Text style={styles.text}>
            To become a trusted digital partner by continuously improving our
            solutions and adapting to the evolving needs of our users.
          </Text>
        </View>

        {/* What We Offer */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <Text style={styles.listItem}>• Modern and intuitive mobile apps</Text>
          <Text style={styles.listItem}>• Secure and reliable systems</Text>
          <Text style={styles.listItem}>• Fast and responsive customer support</Text>
          <Text style={styles.listItem}>• Continuous updates and improvements</Text>
        </View>

        {/* Core Values */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Our Core Values</Text>
          <Text style={styles.listItem}>• User-first approach</Text>
          <Text style={styles.listItem}>• Transparency and trust</Text>
          <Text style={styles.listItem}>• Quality and reliability</Text>
          <Text style={styles.listItem}>• Innovation and growth</Text>
        </View>

        {/* Trust */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Our Commitment</Text>
          <Text style={styles.text}>
            We are committed to protecting your data, respecting your privacy,
            and providing dependable support whenever you need it. Your trust is
            our highest priority.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    alignItems: 'center',
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 14,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 6,
  },
  text: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginTop: 10,
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginVertical: 20,
  },
});

