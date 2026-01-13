import { Feather, SimpleLineIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'; // NEW NATIVE GOOGLE LIBRARY
import { router, useNavigation } from 'expo-router';
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
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
import { useApp } from "../../context/AppProvider";

// Complete auth session if needed (Good practice, but less relevant for the native flow)
WebBrowser.maybeCompleteAuthSession();

// 1. Google OAuth Client IDs (Ensure these are your actual IDs)
// The webClientId is crucial here for requesting the ID token for backend authentication.
const iosClientId = '767126589910-se67tnks7gsv2vrpjf7hl9lv9k9dbkq6.apps.googleusercontent.com';
const androidClientId = '767126589910-bpjljs2h4h4bipspltq6mknt2lr08bru.apps.googleusercontent.com';
const webClientId = '767126589910-1dkq7e4p4f92aufiv7h01pkjn9ouhtmn.apps.googleusercontent.com'; // This is the Server Client ID

// 2. Configure the Google Sign-In Library globally
GoogleSignin.configure({
  scopes: ['email', 'profile'], 
  webClientId: webClientId, // Server client ID
  iosClientId: iosClientId,
  offlineAccess: true, // Request offline access for refresh tokens
});
export default function CombinedAuthComponent() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [showPassword, setShowPassword] = useState(false);
  const [userCredentials, setUserCredentials] = useState({ username: "", password: "" });
  const [signingIn, setSigningIn] = useState(false); // Renamed from signNewUser for clarity
  const [loading, setLoading] = useState(true);
  const { userInfo, setUserInfo,set_is_logged_in } = useApp();
  
  // NOTE: Removed Google.useAuthRequest and its related useEffect

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const user = await AsyncStorage.getItem("@user");
    if (user) setUserInfo(JSON.parse(user));
    setLoading(false);
  };
  
  // 3. Native Google Sign-In Handler
  const handleGoogleLogin = async () => {
    setSigningIn(true);
    try {
      // 1. Check if Google Play Services is available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // 2. Start the native sign-in flow
		const result = await GoogleSignin.signIn();
     	console.log('Google sign-in result:', result);

		const { data,type } = result;
      if (type !== 'success') {
        throw new Error('Google Sign-In was not successful');
      }else {

      setUserInfo(data)
      await AsyncStorage.setItem('@user', JSON.stringify(data));
      await AsyncStorage.setItem('@authToken', data.idToken);

      
      // OPTIONAL: Send idToken to your backend for verification and session creation
      // const backendResponse = await fetch('YOUR_BACKEND_URL/api/google-login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ idToken }),
      // });
      // const backendUser = await backendResponse.json();

      // 3. Store user info and navigate
      // await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(data);
      set_is_logged_in(true);
      router.navigate("/");
      
    }} catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow (e.g., hit back button)
        console.log('Google Sign-In cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation (e.g. sign in) is in progress already
        console.log('Google Sign-In in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available or outdated.');
      } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        Alert.alert('Error', 'Sign-in required. Try again.');
      } else {
		  if (error.code === statusCodes.DEVELOPER_ERROR) {
			  // This confirms the issue is definitely the SHA-1 or Bundle ID mismatch
			  Alert.alert('Configuration Error', 'The app identifiers do not match the Google Cloud Console settings.');}
		  }
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Google as well
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem("@user");
      setUserInfo(null);
      set_is_logged_in(false);
      
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleCredentialSignIn = async () => {
  setLoading(true);

  // Prepare data to send to server
  const credentials = {
    username: userCredentials.username,
    password: userCredentials.password,
  };

  try {
    // Send the credentials to the server for authentication
    const response = await fetch('https://msaidizi.nsaro.com/login_api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

      console.log('====================================');
      console.log(data);
      console.log('====================================');
    if (response.ok) {
      // If authentication is successful
      const { access } = data;

      // Store user info and token in AsyncStorage
      await AsyncStorage.setItem('@user', JSON.stringify(userCredentials.username));
      await AsyncStorage.setItem('@authToken', access); // Store token as well

      // Set user info and mark user as logged in
      setUserInfo(userCredentials.username);
      set_is_logged_in(true);
      
      // Navigate to the home screen
      router.navigate('/');
    } else {
      // Handle login failure (invalid username/password)
      Alert.alert('Login Failed', data.message || 'Invalid username or password.');
    }
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Login Failed', 'An error occurred during login. Please try again.');
  }

  setLoading(false);
};


  if (loading) {
      return (
          <View style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}>
              <ActivityIndicator size="large" color="#007bff" />
          </View>
      );
  }

  // --- Render Logic ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
          <>
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ height: 100, width: 100, marginBottom: 20 }}
            />
            <Text style={styles.header}>Login to Your Account</Text>

            {/* username Input */}
            <View style={styles.inputContainer}>
              <SimpleLineIcons name="envelope" size={24} color="#1B1818" />
              <TextInput
                placeholder="username"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={userCredentials.username}
                onChangeText={(text) =>
                  setUserCredentials({ ...userCredentials, username: text })
                }
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={24} color="#1B1818" />
              <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry={!showPassword}
                value={userCredentials.password}
                onChangeText={(text) =>
                  setUserCredentials({ ...userCredentials, password: text })
                }
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              disabled={signingIn || loading}
              style={[styles.loginButton, (signingIn || loading) && styles.disabled]}
              onPress={handleCredentialSignIn}
            >
              {loading ?
              <ActivityIndicator size="large" color="white" />:
              <Text style={styles.loginText}>Login</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity
              disabled={signingIn || loading}
              style={[styles.googleButton, (signingIn || loading) && styles.disabled]}
              onPress={handleGoogleLogin} // NEW HANDLER
            >
              {signingIn ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Image
                    source={require("../../assets/images/googleImg.png")}
                    style={styles.socialIcon}
                  />
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scroll: {
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    width: "100%",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#999",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    justifyContent: "center",
  },
  googleText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  socialIcon: {
    height: 24,
    width: 24,
  },
  profileContainer: {
    alignItems: "center",
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  disabled: {
    opacity: 0.5,
  },
});
