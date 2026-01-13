import { useApp } from "@/context/AppProvider";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const handleRateUs = () => {
  const iosAppStoreUrl =
    "itms-apps://apps.apple.com/app/idYOUR_APP_ID?action=write-review";
  const androidPlayStoreUrl = "market://details?id=com.yourcompany.yourapp";

  const url = Platform.OS === "ios" ? iosAppStoreUrl : androidPlayStoreUrl;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open the store.");
      }
    })
    .catch((err) => console.error("An error occurred", err));
};

const handleLogout = async () => {
  await AsyncStorage.multiRemove(["@user", "@accessToken", "@refreshToken"]);
  router.replace("/(auth)/sign-in");
};

const ProfilePage = () => {
  const { userInfo,password_user_session } = useApp();
  const user = userInfo;
  const client = password_user_session;

  console.log("User Info in ProfilePage:", password_user_session);
  console.log("User Info in ProfilePage:", password_user_session);

  // State for notification toggle (example)
  const [isNotificationsEnabled, setIsNotificationsEnabled] =React.useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = React.useState(false);
  const [userAvatar, setUserAvatar] = React.useState(user?.photo); // Placeholder avatar

  const handleChangeAvatar = () => {
    console.log("Change avatar pressed!");
    // setUserAvatar("https://placehold.co/80x80/999999/ffffff?text=User");
  };

  // Load preferences from AsyncStorage when component mounts
  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load notifications preference
        const notificationsValue = await AsyncStorage.getItem(
          "notificationsEnabled"
        );
        if (notificationsValue !== null) {
          setIsNotificationsEnabled(notificationsValue === "true");
        }

        // Load dark mode preference
        const darkModeValue = await AsyncStorage.getItem("isDarkModeEnabled");
        if (darkModeValue !== null) {
          setIsDarkModeEnabled(darkModeValue === "true");
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  // Function to handle toggle
  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setIsNotificationsEnabled(true);
        await AsyncStorage.setItem("notificationsEnabled", "true");
      } else {
        Alert.alert(
          "Permission Denied",
          "You need to allow notifications to enable this setting.",
          [{ text: "OK" }]
        );
        setIsNotificationsEnabled(false);
        await AsyncStorage.setItem("notificationsEnabled", "false");
      }
    } else {
      setIsNotificationsEnabled(false);
      await AsyncStorage.setItem("notificationsEnabled", "false");
    }
  };

  // Function to handle dark mode toggle
  const handleDarkModeToggle = async (value: boolean) => {
    setIsDarkModeEnabled(value);
    await AsyncStorage.setItem("isDarkModeEnabled", value.toString());
  };

  const handleShareApp = async () => {
    console.log("Sharing the app...");

    try {
      const result = await Share.share({
        message:
          "Check out this awesome app! 🚀 Download it here: https://your-app-link.com",
        title: "Awesome App",
      });

      // Optional: handle different share outcomes
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type: ", result.activityType);
        } else {
          console.log("Shared successfully!");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing the app:", error.message);
    }
  };

  const theme = isDarkModeEnabled ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Profile
        </Text>
        <View style={styles.placeholderRight} /> {/* To balance the header */}
      </View>

      <ScrollView style={styles.scrollViewContent}>
        {/* User Info Section */}
        <View
          style={[
            styles.userInfoSection,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <TouchableOpacity onPress={handleChangeAvatar}>
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
            <View style={styles.cameraIconContainer}>
              <MaterialIcons name="camera-alt" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.givenName} {user?.familyName} 
            {client ? `${client}` : ""}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.text }]}>
            {user?.email}
          </Text>
          <TouchableOpacity
            style={[
              styles.editProfileButton,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Account Settings
        </Text>
        <ProfileOption
          icon="notifications"
          name="Notifications"
          hasToggle={true}
          toggleValue={isNotificationsEnabled}
          onToggleChange={handleNotificationToggle}
          theme={theme}
        />
        <ProfileOption
          icon="lock"
          name="Change Password"
          theme={theme}
          onPress={() => router.push("../ChangePasswordPage")}
        />
        {/* <ProfileOption icon="credit-card" name="Payment Methods" theme={theme}  onPress={()=>router.push("/PaymentMethodsPage")} />
                    <ProfileOption icon="location-on" name="Addresses" theme={theme}  onPress={()=>router.push("/AddressesPage")}  />
                    <ProfileOption icon="receipt" name="My Orders"      theme={theme}  onPress={()=>router.push("/MyOrdersPage")}  />
                    <ProfileOption icon="bookmark" name="Saved Items" theme={theme}  onPress={()=>router.push("/SavedItemsPage")}  /> */}

        {/* Security Section */}
        {/* <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Security</Text> */}
        {/* <ProfileOption
                        icon="two-factor-authentication" // MaterialCommunityIcons
                        name="Two-Factor Authentication"
                        hasToggle={true}
                        toggleValue={false} // Example: default off
                        onToggleChange={() => console.log('Two-factor toggle')}
                        theme={theme}
                    /> */}
        {/* <ProfileOption icon="devices" name="Connected Devices" theme={theme} onPress={()=>router.push("/ConnectedDevicesPage")}  /> */}
        {/* <ProfileOption icon="history" name="Recent Activity" theme={theme} onPress={()=>router.push("/RecentActivityPage")} /> */}

        {/* Preferences Section */}
        {/* <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Preferences</Text>
                    <ProfileOption
                        icon="theme-light-dark" // Using MaterialCommunityIcons for this
                        name="Dark Mode"
                        hasToggle={true}
                        toggleValue={isDarkModeEnabled}
                        onToggleChange={handleDarkModeToggle}
                        theme={theme}
                    /> */}
        {/* <ProfileOption icon="language" name="Language" theme={theme} onPress={()=>router.push("/LanguagePage")} /> */}
        {/* <ProfileOption icon="currency-usd" name="Currency" /> MaterialCommunityIcons /}
                    <ProfileOption icon="scale" name="Units" /> {/* MaterialCommunityIcons */}

        {/* General Settings */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          General
        </Text>
        <ProfileOption
          icon="help-circle-outline"
          name="F.A.Q."
          onPress={() => router.push("../FAQPage")}
          theme={theme}
        />
        <ProfileOption
          icon="information-circle-outline"
          name="About Us"
          onPress={() => router.push("../AboutUsPage")}
          theme={theme}
        />

        {/* Legal Section /}
                    <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Legal</Text>
                    <ProfileOption icon="document-text-outline" name="Terms of Service" theme={theme} />
                    <ProfileOption icon="shield-checkmark-outline" name="Privacy Policy" theme={theme} />
                    <ProfileOption icon="cookie" name="Cookie Policy" /> {/* MaterialCommunityIcons /}
                    <ProfileOption icon="license" name="Licensing Information" /> {/* MaterialIcons */}

        {/* Support */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Support
        </Text>
        <ProfileOption
          icon="mail-outline"
          name="Contact Support"
          onPress={() => navigate("../SupportPage")}
          theme={theme}
        />
        <ProfileOption
          icon="star-outline"
          name="Rate Us"
          onPress={() => handleRateUs()}
          theme={theme}
        />
        <ProfileOption
          icon="share-variant"
          name="Share App"
          onPress={() => handleShareApp()}
          theme={theme}
        />

        {/* Danger Zone (Optional but good for comprehensive) */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Danger Zone
        </Text>
        <TouchableOpacity
          style={[
            styles.optionContainer,
            { borderBottomWidth: 0, backgroundColor: theme.colors.card },
          ]}
          onPress={() => router.push("/DeleteAccountPage")}
        >
          <View style={styles.optionLeft}>
            <MaterialIcons
              name="delete-forever"
              size={24}
              color="#FF0000"
              style={styles.optionIcon}
            />
            <Text style={[styles.optionText, { color: "#FF0000" }]}>
              Delete Account
            </Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => {
            handleLogout();
          }}
        >
          <MaterialIcons
            name="logout"
            size={24}
            color="white"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileOption = ({
  icon = "",
  name = "",
  hasToggle = false,
  toggleValue = () => {},
  onToggleChange = () => {},
  onPress = () => {},
  theme,
}) => {
  // Determine which icon library to use based on the icon name
  let IconComponent = MaterialIcons;
  if (
    [
      "document-text-outline",
      "help-circle-outline",
      "shield-checkmark-outline",
      "information-circle-outline",
      "mail-outline",
      "star-outline",
    ].includes(icon)
  ) {
    IconComponent = Ionicons;
  } else if (
    [
      "receipt",
      "bookmark",
      "theme-light-dark",
      "two-factor-authentication",
      "currency-usd",
      "scale",
      "cookie",
      "share-variant",
    ].includes(icon)
  ) {
    IconComponent = MaterialCommunityIcons;
  }

  return (
    <TouchableOpacity
      style={[styles.optionContainer, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        <IconComponent
          name={icon}
          size={24}
          color={theme.colors.text}
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          {name}
        </Text>
      </View>
      {hasToggle ? (
        <Switch
          trackColor={{ false: "#767577", true: theme.colors.primary }}
          thumbColor={toggleValue ? "#f4f3f4" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onToggleChange}
          value={toggleValue}
        />
      ) : (
        <MaterialIcons name="keyboard-arrow-right" size={24} color="#ccc" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    display: "none",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholderRight: {
    width: 34, // Same width as back button to center title
  },
  scrollViewContent: {
    flex: 1,
    paddingVertical: 10,
  },
  userInfoSection: {
    alignItems: "center",
    paddingVertical: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF0000",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF0000",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 5,
  },
  editProfileButton: {
    marginTop: 15,
    backgroundColor: "#FF0000",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#FF0000",
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfilePage;
