import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import api from "@/assets/api"

const { width, height } = Dimensions.get("window");

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.password2) {
      newErrors.password2 = "Please confirm your password";
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleRegister = async () => {
    if (!validateForm()) return;
  
    setIsLoading(true);
    try {
        const res = await api.post("/authentication/register/", {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password2: formData.password2,
      });
  
      Alert.alert("Success!", "Account created successfully.", [
        { text: "OK", onPress: () => console.log("Navigate to login") },
      ]);
    } catch (error) {
      console.log("Registration failed:", error.response?.data || error.message);
  
      // Show detailed validation errors from backend
      if (error.response?.data) {
        const apiErrors = error.response.data;
        const newErrors = {};
        for (const key in apiErrors) {
          newErrors[key] = apiErrors[key][0];
        }
        setErrors(newErrors);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSocialRegister = (provider) => {
    console.log(`Register with ${provider}`);
  };

  const renderInput = (
    field,
    label,
    placeholder,
    options
  ) => {
    const {
      icon,
      keyboardType = "default",
      autoCapitalize = "sentences",
      secureTextEntry = false,
      showToggle = false,
      toggleState = false,
      onToggle,
    } = options;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View
          style={[
            styles.inputContainer,
            errors[field] && styles.inputContainerError,
          ]}
        >
          <MaterialIcons
            name={icon}
            size={20}
            color="#6b7280"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor="#6b7280"
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            secureTextEntry={secureTextEntry && !toggleState}
          />
          {showToggle && (
            <TouchableOpacity onPress={onToggle} style={styles.eyeIcon}>
              <Ionicons
                name={toggleState ? "eye-off" : "eye"}
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>
          )}
        </View>
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f0f14" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Join us to start your health journey today
            </Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          {renderInput("username", "Username", "Choose a unique username", {
            icon: "person",
            autoCapitalize: "none",
          })}

          {renderInput("email", "Email Address", "Enter your email address", {
            icon: "email",
            keyboardType: "email-address",
            autoCapitalize: "none",
          })}

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              {renderInput("first_name", "First Name", "First name", {
                icon: "badge",
                autoCapitalize: "words",
              })}
            </View>
            <View style={styles.nameField}>
              {renderInput("last_name", "Last Name", "Last name", {
                icon: "badge",
                autoCapitalize: "words",
              })}
            </View>
          </View>

          {renderInput("password", "Password", "Create a strong password", {
            icon: "lock",
            secureTextEntry: true,
            showToggle: true,
            toggleState: showPassword,
            onToggle: () => setShowPassword(!showPassword),
            autoCapitalize: "none",
          })}

          {renderInput(
            "password2",
            "Confirm Password",
            "Confirm your password",
            {
              icon: "lock-outline",
              secureTextEntry: true,
              showToggle: true,
              toggleState: showConfirmPassword,
              onToggle: () => setShowConfirmPassword(!showConfirmPassword),
              autoCapitalize: "none",
            }
          )}

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirement}>
                <MaterialIcons
                  name={
                    formData.password.length >= 8
                      ? "check-circle"
                      : "radio-button-unchecked"
                  }
                  size={16}
                  color={formData.password.length >= 8 ? "#10b981" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.requirementText,
                    formData.password.length >= 8 && styles.requirementMet,
                  ]}
                >
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.requirement}>
                <MaterialIcons
                  name={
                    formData.password === formData.password2 &&
                    formData.password2
                      ? "check-circle"
                      : "radio-button-unchecked"
                  }
                  size={16}
                  color={
                    formData.password === formData.password2 &&
                    formData.password2
                      ? "#10b981"
                      : "#6b7280"
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    formData.password === formData.password2 &&
                      formData.password2 &&
                      styles.requirementMet,
                  ]}
                >
                  Passwords match
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              isLoading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.registerButtonText}>
                  Creating Account...
                </Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialRegister("Google")}
            >
              <MaterialIcons name="account-circle" size={24} color="#db4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialRegister("Apple")}
            >
              <MaterialIcons name="apple" size={24} color="#000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Link href="/login">
              <Text style={styles.signInText}>Sign In</Text>
            </Link>
          </Text>
        </View>

        <View style={styles.privacyNotice}>
          <View style={styles.privacyCard}>
            <MaterialIcons name="security" size={20} color="#10b981" />
            <Text style={styles.privacyText}>
              🔒 Your health data is encrypted and secure. We follow HIPAA
              compliance standards.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  welcomeSection: {
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f3f4f6",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#374151",
  },
  inputContainerError: {
    borderColor: "#ef4444",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  passwordRequirements: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  requirementsTitle: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementsList: {
    gap: 6,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
  },
  requirementText: {
    color: "#9ca3af",
    fontSize: 13,
    marginLeft: 8,
  },
  requirementMet: {
    color: "#10b981",
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    color: "#9ca3af",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  linkText: {
    color: "#009b7c",
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "#009b7c",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#009b7c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    borderTopColor: "transparent",
    marginRight: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#374151",
  },
  dividerText: {
    color: "#6b7280",
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  signInText: {
    color: "#009b7c",
    fontWeight: "600",
  },
  privacyNotice: {
    marginTop: 10,
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  privacyText: {
    flex: 1,
    color: "#d1d5db",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 12,
  },
});
