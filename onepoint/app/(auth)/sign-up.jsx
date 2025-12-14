import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, SimpleLineIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";

export default function SignUpComponent() {
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSignUp = async () => {
    const { first_name, last_name, username, email, phoneNumber, password } = formData;

    if (!first_name || !last_name || !username || !email || !phoneNumber || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("https://msaidizi.nsaro.com/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          username,
          email,
          phone_number: phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming the backend returns the user data and token
        const { token, user } = data;

        // Store the token in AsyncStorage
        await AsyncStorage.setItem("@auth_token", token);

        // Optionally, store user info as well
        await AsyncStorage.setItem("@user", JSON.stringify(user));

        Alert.alert("Sign Up Successful", "You can now log in.");

        // Navigate to login page
        navigation.navigate("SignIn"); // Adjust navigation as needed
      } else {
        setErrorMessage(data.error || data.detail || "An error occurred during sign up.");
      }
    } catch (error) {
      console.error("Sign Up Error:", error);
      setErrorMessage("There was an error signing you up. Please try again.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a New Account</Text>

      {/* First Name Input */}
      <View style={styles.inputContainer}>
        <Feather name="user" size={24} color="#1B1818" />
        <TextInput
          placeholder="First Name"
          style={styles.input}
          value={formData.first_name}
          onChangeText={(text) => handleInputChange("first_name", text)}
        />
      </View>

      {/* Last Name Input */}
      <View style={styles.inputContainer}>
        <Feather name="user" size={24} color="#1B1818" />
        <TextInput
          placeholder="Last Name"
          style={styles.input}
          value={formData.last_name}
          onChangeText={(text) => handleInputChange("last_name", text)}
        />
      </View>

      {/* Username Input */}
      <View style={styles.inputContainer}>
        <Feather name="user" size={24} color="#1B1818" />
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={formData.username}
          onChangeText={(text) => handleInputChange("username", text)}
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <SimpleLineIcons name="envelope" size={24} color="#1B1818" />
        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleInputChange("email", text)}
        />
      </View>

      {/* Phone Number Input */}
      <View style={styles.inputContainer}>
        <Feather name="phone" size={24} color="#1B1818" />
        <TextInput
          placeholder="Phone Number"
          style={styles.input}
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={(text) => handleInputChange("phoneNumber", text)}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Feather name="lock" size={24} color="#1B1818" />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry={!showPassword}
          value={formData.password}
          onChangeText={(text) => handleInputChange("password", text)}
        />
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
          <Feather name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

      {/* Sign Up Button */}
      <TouchableOpacity
        disabled={loading}
        style={[styles.button, loading && styles.disabled]}
        onPress={handleSignUp}
      >
        {!loading ? (
          <Text style={styles.buttonText}>Sign Up</Text>
        ) : (
          <ActivityIndicator size="small" color="#fff" />
        )}
      </TouchableOpacity>

      {/* Already have an account? Login */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate("SignIn")}
      >
        <Text style={styles.loginText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginVertical: 10,
  },
  loginLink: {
    marginTop: 15,
    alignItems: "center",
  },
  loginText: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
