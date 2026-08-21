import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  TextInput,
} from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import api from "@/assets/api";

const InputField = React.memo(({ label, value, field, icon, multiline = false, keyboardType = 'default', updateHealthData }) => (
  <View style={styles.inputContainer}>
    <View style={styles.inputLabelContainer}>
      <MaterialIcons name={icon} size={20} color="#6b7280" style={styles.inputIcon} />
      <Text style={styles.inputLabel}>{label}</Text>
    </View>
    <TextInput
      style={[styles.inputField, multiline && styles.multilineInput]}
      value={value}
      onChangeText={(text) => updateHealthData(field, text)}
      placeholder={`Enter ${label.toLowerCase()}`}
      placeholderTextColor="#4b5563"
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
));
InputField.displayName = "InputField";

const HealthSetupScreen = () => {
  const [healthData, setHealthData] = useState({
    blood_type: "",
    genotype: "",
    weight: "",
    allergies: "",
    conditions: "",
    medications: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    vaccination_history: "",
    dietary_restrictions: "",
    smoking_status: "",
    alcohol_consumption: "",
    physical_activity_level: "",
  });

  const router = useRouter();

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/emergency-profile/");
        if (response.data) {
          setHealthData(prev => ({
            ...prev,
            ...response.data,
            weight: response.data.weight ? response.data.weight.toString() : ""
          }));
        }
      } catch (error) {
        // If 404, it means the profile doesn't exist yet, which is fine for new users
        if (error?.response?.status !== 404) {
          console.log("Error fetching profile:", error);
        }
      }
    };
    fetchProfile();
  }, []);

  const updateHealthData = useCallback((field, value) => {
    setHealthData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleContinue = async () => {
    try {
      const formattedData = {
        ...healthData,
        weight: healthData.weight ? parseFloat(healthData.weight) : null,
      };

      const response = await api.post("/api/emergency-profile/", formattedData);
      console.log("Profile saved:", response.data);
      Alert.alert("Success", "Health profile setup completed!");
      router.push('/emergency-profile');
    } catch (error) {
      console.log("Error saving profile:", error?.response?.data || error.message);
      Alert.alert("Error", "Failed to save profile. Please check all fields.");
    }
  };

  const fieldIcons = {
    blood_type: "bloodtype",
    genotype: "science",
    weight: "monitor-weight",
    allergies: "warning",
    conditions: "healing",
    medications: "medication",
    emergency_contact_name: "person",
    emergency_contact_phone: "phone",
    vaccination_history: "vaccines",
    dietary_restrictions: "restaurant",
    smoking_status: "smoke-free",
    alcohol_consumption: "local-bar",
    physical_activity_level: "directions-run"
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f14" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          {/* <Link href="/emergency-profile" asChild> */}
            <TouchableOpacity style={styles.backButton} onPress={() => {
              router.push("/(tabs)/")
            }}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          {/* </Link> */}
          <Text style={styles.headerTitle}>Setup Health Profile</Text>
          <View style={styles.shareButtonPlaceholder} />
        </View>

        {/* Form Sections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#fef2f2' }]}>
              <MaterialIcons name="bloodtype" size={20} color="#ef4444" />
            </View>
            <Text style={styles.sectionTitle}>Blood & Genetics</Text>
          </View>
          
          <InputField
            key="blood_type"
            label="Blood Type"
            value={healthData.blood_type}
            field="blood_type"
            icon={fieldIcons.blood_type}
            updateHealthData={updateHealthData}
          />
          <InputField
            key="genotype"
            label="Genotype"
            value={healthData.genotype}
            field="genotype"
            icon={fieldIcons.genotype}
            updateHealthData={updateHealthData}
          />
          <InputField
            key="weight"
            label="Weight (kg)"
            value={healthData.weight}
            field="weight"
            icon={fieldIcons.weight}
            keyboardType="numeric"
            updateHealthData={updateHealthData}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#fffbeb' }]}>
              <MaterialIcons name="medical-services" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.sectionTitle}>Medical Information</Text>
          </View>
          
          <InputField
            key="allergies"
            label="Allergies"
            value={healthData.allergies}
            field="allergies"
            icon={fieldIcons.allergies}
            multiline={true}
            updateHealthData={updateHealthData}
          />
          <InputField
            key="conditions"
            label="Conditions"
            value={healthData.conditions}
            field="conditions"
            icon={fieldIcons.conditions}
            multiline={true}
            updateHealthData={updateHealthData}
          />
          <InputField
            key="medications"
            label="Medications"
            value={healthData.medications}
            field="medications"
            icon={fieldIcons.medications}
            multiline={true}
            updateHealthData={updateHealthData}
          />
          <InputField
            key="vaccination_history"
            label="Vaccination History"
            value={healthData.vaccination_history}
            field="vaccination_history"
            icon={fieldIcons.vaccination_history}
            multiline={true}
            updateHealthData={updateHealthData}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#f0fdf4' }]}>
              <MaterialIcons name="contact-phone" size={20} color="#10b981" />
            </View>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
          </View>
          
          <InputField
            key="emergency_contact_name"
            label="Contact Name"
            value={healthData.emergency_contact_name}
            field="emergency_contact_name"
            icon={fieldIcons.emergency_contact_name}
            updateHealthData={updateHealthData}
          />
          <InputField
            key="emergency_contact_phone"
            label="Phone Number"
            value={healthData.emergency_contact_phone}
            field="emergency_contact_phone"
            icon={fieldIcons.emergency_contact_phone}
            keyboardType="phone-pad"
            updateHealthData={updateHealthData}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#f5f3ff' }]}>
              <MaterialIcons name="fitness-center" size={20} color="#009b7c" />
            </View>
            <Text style={styles.sectionTitle}>Lifestyle</Text>
          </View>
          
          <InputField
            key="dietary_restrictions"
            label="Dietary Restrictions"
            value={healthData.dietary_restrictions}
            field="dietary_restrictions"
            icon={fieldIcons.dietary_restrictions}
            updateHealthData={updateHealthData}
          />
          <InputField
            key="smoking_status"
            label="Smoking Status"
            value={healthData.smoking_status}
            field="smoking_status"
            icon={fieldIcons.smoking_status}
            updateHealthData={updateHealthData}
          />
          <InputField
            key="alcohol_consumption"
            label="Alcohol Consumption"
            value={healthData.alcohol_consumption}
            field="alcohol_consumption"
            icon={fieldIcons.alcohol_consumption}
            updateHealthData={updateHealthData}
          />
          <InputField
            key="physical_activity_level"
            label="Physical Activity"
            value={healthData.physical_activity_level}
            field="physical_activity_level"
            icon={fieldIcons.physical_activity_level}
            updateHealthData={updateHealthData}
          />
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Save Health Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  shareButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  inputContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  inputField: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
    padding: 0,
    marginTop: 4,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  continueButton: {
    backgroundColor: "#009b7c",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#009b7c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HealthSetupScreen;