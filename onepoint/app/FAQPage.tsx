import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAQ_DATA = [
  {
    question: 'What is this app about?',
    answer:
      'This app is designed to provide simple, reliable, and user-friendly solutions to help you complete tasks efficiently.',
  },
  {
    question: 'How can I contact support?',
    answer:
      'You can contact our support team directly through WhatsApp from the Support page inside the app.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Yes. We take data protection and privacy seriously by using secure technologies and best practices.',
  },
  {
    question: 'Is the app free to use?',
    answer:
      'Yes, the app is free to download. Some features may require future upgrades or additional services.',
  },
  {
    question: 'Which devices are supported?',
    answer:
      'The app supports both Android and iOS devices running modern operating systems.',
  },
];

const FAQItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.questionRow} onPress={toggleExpand}>
        <Text style={styles.question}>{item.question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color="#555"
        />
      </TouchableOpacity>

      {expanded && <Text style={styles.answer}>{item.answer}</Text>}
    </View>
  );
};

const FAQPage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="help-circle-outline" size={72} color="#4A90E2" />
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.subtitle}>
            Find quick answers to common questions.
          </Text>
        </View>

        {/* FAQ List */}
        {FAQ_DATA.map((item, index) => (
          <FAQItem key={index} item={item} />
        ))}

        {/* Footer */}
        <Text style={styles.footer}>
          Still need help? Contact us via the Support page.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQPage;

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
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 18,
    elevation: 3,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 10,
  },
  answer: {
    marginTop: 12,
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: '#777',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
});

