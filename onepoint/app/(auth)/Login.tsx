// CombinedAuthComponent.js
import { Feather, SimpleLineIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import { router, useNavigation } from 'expo-router';
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../../context/AppProvider";

// Complete auth session if needed
WebBrowser.maybeCompleteAuthSession();

// Your Google OAuth client IDs
const iosClientId = '767126589910-se67tnks7gsv2vrpjf7hl9lv9k9dbkq6.apps.googleusercontent.com';
const androidClientId = '767126589910-bpjljs2h4h4bipspltq6mknt2lr08bru.apps.googleusercontent.com';
const webClientId = '767126589910-1dkq7e4p4f92aufiv7h01pkjn9ouhtmn.apps.googleusercontent.com';

export default function CombinedAuthComponent() {
    const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  const [showPassword, setShowPassword] = useState(false);
  const [userCredentials, setUserCredentials] = useState({ username: "", password: "" });
  const [userInfo, setUserInfo] = useState(null);
  const [signNewUser, setSignNewUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const { is_logged_in, set_is_logged_in } = useApp();
console.log(is_logged_in);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId,
    androidClientId,
    // webClientId,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication) {
        getUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const user = await AsyncStorage.getItem("@user");
    if (user) setUserInfo(JSON.parse(user));
    setLoading(false);
  };

  const getUserInfo = async (token) => {
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (err) {
      console.error("Google user info error:", err);
    }
  };

  const handleGoogleLogin = async () => {
    setSignNewUser(true);
    await promptAsync();
    setSignNewUser(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("@user");
    setUserInfo(null);
  };

  const handleCredentialSignIn = async () => {
    setLoading(true);
    // TODO: Replace this with actual backend authentication
    if (userCredentials.password == "password" && userCredentials.username == "nsaro" || userCredentials.username == "Nsaro" && userCredentials.password == "password") {
      const fakeUser = {
        name: "testuser",
        username: userCredentials.username,
      };
      await AsyncStorage.setItem("@user", JSON.stringify(fakeUser));
      setUserInfo(fakeUser);
      set_is_logged_in(true)
      router.navigate("/");
    } else {
      Alert.alert("Login Failed", "Invalid username or password.");
    }
    setLoading(false);
  };

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
                keyboardType="username-address"
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
              disabled={signNewUser}
              style={[styles.loginButton, signNewUser && styles.disabled]}
              onPress={handleCredentialSignIn}
            >
              {loading?
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
              disabled={signNewUser || !request}
              style={[styles.googleButton, signNewUser && styles.disabled]}
              onPress={handleGoogleLogin}
            >
              <Image
                source={require("../../assets/images/googleImg.png")}
                style={styles.socialIcon}
              />
              <Text style={styles.googleText}>Continue with Google</Text>
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
