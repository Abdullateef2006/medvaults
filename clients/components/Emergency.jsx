import api from "../assets/api.js";
import { Alert, Linking } from "react-native";
import * as Location from "expo-location";

export const SendEmergencyAlert = async () => {
  try {
    // 🔐 Request permission with detailed feedback
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Location Permission Required",
        "MedVault needs location access to send emergency alerts.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings()
          }
        ]
      );
      return;
    }

    // Check if location services are enabled
    if (!await Location.hasServicesEnabledAsync()) {
      Alert.alert(
        "Enable Location Services",
        "Please enable location services in your device settings.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings()
          }
        ]
      );
      return;
    }

    // 📍 Get current location with fallbacks
    const locationOptions = {
      accuracy: Location.Accuracy.BestForNavigation,
      timeout: 15000, // 15 seconds timeout
      distanceInterval: 10, // Minimum change in meters to update
    };

    const location = await Promise.race([
      Location.getCurrentPositionAsync(locationOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Location request timed out")), 15000)
      )
    ]);

    const { latitude, longitude } = location.coords;

    // 🚀 Send alert to backend with timeout
    const response = await Promise.race([
      api.post("/send_message/", {
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Server request timed out")), 10000)
      )
    ]);

    console.log("Emergency sent ✅", response.data);
    Alert.alert(
      "Alert Sent",
      "Your emergency alert has been successfully sent with your location.",
      [{ text: "OK" }]
    );
    
    return response.data;
  } catch (error) {
    console.error("Emergency alert failed ❌", error);
    
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = error.response.data?.message ||
        `Server error: ${error.response.status}`;
    }

    Alert.alert(
      "Alert Failed",
      errorMessage || "Could not send emergency alert. Please try again.",
      [{ text: "OK" }]
    );
    
    throw error;
  }
};
