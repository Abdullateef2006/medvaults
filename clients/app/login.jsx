import React, { useState } from 'react';
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
} from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import api from "@/assets/api"
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()


  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/authentication/login/', {username: username, password });
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
      Alert.alert('Login Success');
      router.push('/health_setup');
    } catch (error) {
      Alert.alert('Login Failed', 'Check your credentials');
      console.log("Error details:", error.response?.data || error.message); // ✅ See backend error
      
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f0f14" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your health journey
            </Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your username"
                placeholderTextColor="#6b7280"
                value={username}
                onChangeText={setUsername}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.loginButtonText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Google')}
            >
              <MaterialIcons name="account-circle" size={24} color="#db4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Apple')}
            >
              <MaterialIcons name="apple" size={24} color="#000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Link href="/register">
              <Text style={styles.signUpText}>Sign Up</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  welcomeSection: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#009b7c',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#009b7c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#009b7c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderTopColor: 'transparent',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#6b7280',
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  biometricButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 32,
  },
  biometricText: {
    color: '#009b7c',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  signUpText: {
    color: '#009b7c',
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipText: {
    flex: 1,
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 12,
  },
});
