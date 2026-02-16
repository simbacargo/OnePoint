import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, SimpleLineIcons, AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from 'expo-router';

// Native Auth Imports
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

import { useApp } from "../../context/AppProvider";

// 1. Configuration
const GOOGLE_WEB_CLIENT_ID = '767126589910-1dkq7e4p4f92aufiv7h01pkjn9ouhtmn.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '767126589910-se67tnks7gsv2vrpjf7hl9lv9k9dbkq6.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
});

export default function CombinedAuthComponent() {
  const navigation = useNavigation();
  const { setUserInfo, set_is_logged_in } = useApp();

  // State
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userCredentials, setUserCredentials] = useState({ username: "", password: "" });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // --- 2. Google Login Handler ---
  const handleGoogleLogin = async () => {
    setSigningIn(true);
    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      
      const result = await GoogleSignin.signIn();
      const userData = result.data; // Newest library version uses .data

      if (userData) {
        await saveAuthSession(userData, userData.idToken);
      }
    } catch (error) {
      handleAuthError(error, "Google");
    } finally {
      setSigningIn(false);
    }
  };

  // --- 3. Apple Login Handler ---
  const handleAppleLogin = async () => {
    try {
      setSigningIn(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          
        ],
      });

      if (credential.identityToken) {
        await saveAuthSession(credential, credential.identityToken);
      }
    } catch (error) {
      handleAuthError(error, "Apple");
    } finally {
      setSigningIn(false);
    }
  };

  // --- 4. Traditional Login Handler ---
  const handleCredentialSignIn = async () => {
    if (!userCredentials.username || !userCredentials.password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8080/login_api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userCredentials),
      });

      const data = await response.json();

      if (response.ok) {
        await saveAuthSession(userCredentials.username, data.access);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to save session and navigate
  const saveAuthSession = async (user, token) => {
    await AsyncStorage.setItem('@user', JSON.stringify(user));
    if (token) await AsyncStorage.setItem('@authToken', token);
    
    setUserInfo(user);
    set_is_logged_in(true);
    router.replace('/'); // Move to home screen
  };

  // Unified Error Handler
  const handleAuthError = (error, type) => {
    if (error.code === statusCodes?.SIGN_IN_CANCELLED || error.code === 'ERR_CANCELED') {
      console.log(`${type} Sign-In cancelled`);
    } else if (error.code === statusCodes?.DEVELOPER_ERROR) {
      Alert.alert("Config Error", "Ensure SHA-1 and Bundle ID match Google Console.");
    } else {
      Alert.alert(`${type} Error`, error.message || "Failed to sign in.");
    }
  };

    useEffect(() => {
      const loadSession = async () => {
        const storedUser = await AsyncStorage.getItem('@user');
        const storedToken = await AsyncStorage.getItem('@authToken');

        if (storedUser && storedToken) {
          setUserInfo(JSON.parse(storedUser));
          set_is_logged_in(true);
          router.replace('/'); // Move to home screen
        }
      };

      loadSession();
    }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.header}>Welcome Back</Text>

        {/* Form Fields */}
        <View style={styles.inputContainer}>
          <SimpleLineIcons name="envelope" size={20} color="#666" />
          <TextInput
            placeholder="Username"
            style={styles.input}
            autoCapitalize="none"
            value={userCredentials.username}
            onChangeText={(t) => setUserCredentials({ ...userCredentials, username: t })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#666" />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={userCredentials.password}
            onChangeText={(t) => setUserCredentials({ ...userCredentials, password: t })}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={loading || signingIn}
          style={[styles.primaryButton, (loading || signingIn) && styles.disabled]}
          onPress={handleCredentialSignIn}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} /><Text style={styles.dividerText}>OR</Text><View style={styles.divider} />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity 
          style={styles.socialButton} 
          onPress={handleGoogleLogin} 
          disabled={signingIn}
        >
          <Image source={require("../../assets/images/googleImg.png")} style={styles.socialIcon} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        {Platform.OS == 'ios' && (
          <TouchableOpacity 
            style={[styles.socialButton, styles.appleButton]} 
            onPress={handleAppleLogin}
            disabled={signingIn}
          >
            <AntDesign name="apple" size={20} color="white" />
            <Text style={[styles.socialText, { color: 'white' }]}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        {signingIn && <ActivityIndicator style={{ marginTop: 20 }} color="#007bff" />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingTop: 60, paddingHorizontal: 25, alignItems: "center" },
  logo: { height: 80, width: 80, marginBottom: 20, borderRadius: 20 },
  header: { fontSize: 26, fontWeight: "800", marginBottom: 30, color: "#1a1a1a" },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f9f9f9"
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: "#333" },
  primaryButton: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 25, width: '100%' },
  divider: { flex: 1, height: 1, backgroundColor: "#eee" },
  dividerText: { marginHorizontal: 15, color: "#999", fontWeight: "600" },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#eee",
    width: "100%",
    justifyContent: "center",
    marginBottom: 12,
  },
  appleButton: { backgroundColor: "#000", borderColor: "#000" },
  socialText: { fontSize: 16, fontWeight: "600", marginLeft: 12, color: "#444" },
  socialIcon: { height: 22, width: 22 },
  disabled: { opacity: 0.6 }
});
