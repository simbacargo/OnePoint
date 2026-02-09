import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "../context/AppProvider";

export default function DeleteAccountScreen() {
  const [loading, setLoading] = useState(false);
  const { setUserInfo, set_is_logged_in } = useApp();

  const handleDeleteRequest = () => {
    Alert.alert(
      "Delete Account?",
      "Are you sure you want to proceed? This action will schedule your account for permanent deletion.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete My Account", 
          style: "destructive", 
          onPress: () => processAccountDeletion() 
        },
      ]
    );
  };

  const processAccountDeletion = async () => {
    setLoading(true);
    try {
      // 1. Call your API to mark the account for deletion
      const response = await fetch('http://127.0.0.1:8080/api/delete-account/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('@authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      // 2. Clear local session
      await AsyncStorage.multiRemove(["@user", "@authToken"]);
      setUserInfo(null);
      set_is_logged_in(false);

      // 3. Show the success message with the 7-day warning
      Alert.alert(
        "Account Scheduled for Deletion",
        "Your account will be permanently deleted in 7 days. If you change your mind, simply log in again before then to cancel this request.",
        [
          { text: "OK", onPress: () => router.replace("/(auth)/sign-in") }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Could not process request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="account-remove-outline" size={80} color="#FF3B30" />
        </View>

        <Text style={styles.title}>Delete Account</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            When you request to delete your account:
          </Text>
          <View style={styles.bulletPoint}>
            <Feather name="clock" size={16} color="#666" />
            <Text style={styles.bulletText}>Your data will be hidden immediately.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Feather name="shield" size={16} color="#666" />
            <Text style={styles.bulletText}>You have <Text style={{fontWeight: '700'}}>7 days</Text> to cancel this request by logging back in.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Feather name="trash-2" size={16} color="#666" />
            <Text style={styles.bulletText}>After 7 days, all your data will be permanently removed from our servers.</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeleteRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Keep My Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  	display:"none"
  },
  headerTitle: { fontSize: 18, fontWeight: "600", marginLeft: 15 },
  content: { padding: 25, alignItems: "center" },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#1a1a1a", marginBottom: 15 },
  infoBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 30,
  },
  infoText: { fontSize: 16, color: "#444", marginBottom: 15, fontWeight: "600" },
  bulletPoint: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  bulletText: { fontSize: 14, color: "#666", marginLeft: 10, flex: 1 },
  deleteButton: {
    backgroundColor: "#FF3B30",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  deleteButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: { width: "100%", padding: 16, alignItems: "center" },
  cancelButtonText: { color: "#007bff", fontSize: 16, fontWeight: "600" },
});
