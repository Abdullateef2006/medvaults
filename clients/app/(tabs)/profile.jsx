import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { useUserData } from '@/hooks/useUserData';


const { width, height } = Dimensions.get('window');

// Mock user data
const userData = {
  username: "wfv0F1m2RsMfOzugS88BTc",
  email: "user@example.com",
  first_name: "David",
  last_name: "Johnson",
  profile_picture: "string"
};

// Quick settings options
const quickSettings = [
  {
    title: "Notifications",
    subtitle: "Push notifications & alerts",
    icon: "notifications",
    color: "#f59e0b",
    bgColor: "#fef3c7"
  },
  {
    title: "Privacy",
    subtitle: "Data sharing & security",
    icon: "security",
    color: "#10b981",
    bgColor: "#d1fae5"
  },
  {
    title: "Account",
    subtitle: "Login & authentication",
    icon: "account-circle",
    color: "#3b82f6",
    bgColor: "#dbeafe"
  },
  {
    title: "Help & Support",
    subtitle: "Get help or contact us",
    icon: "help-outline",
    color: "#009b7c",
    bgColor: "#ede9fe"
  }
];

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

  const { 
    username, 
    email, 
    fullName, 
    lastName,
    firstName,
    error 
  } = useUserData()

  const handleLogout = async () => {
    setIsLoading(true);
    // Simulate logout process
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to login screen
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f14" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={24} color="#009b7c" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={48} color="#fff" />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <MaterialIcons name="camera-alt" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.fullName}>
              {fullName}
            </Text>
            <Text style={styles.username}>@{username}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        {/* Emergency Profile Button */}
        <View style={styles.emergencySection}>
          <Link href="/emergency-profile" asChild>
            <TouchableOpacity style={styles.emergencyButton}>
              <View style={styles.emergencyIconContainer}>
                <MaterialIcons name="local-hospital" size={24} color="#fff" />
              </View>
              <View style={styles.emergencyTextContainer}>
                <Text style={styles.emergencyTitle}>Emergency Profile</Text>
                <Text style={styles.emergencySubtitle}>
                  Quick access to medical information
                </Text>
              </View>
              <MaterialIcons name="arrow-forward" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* User Information Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <MaterialIcons name="person" size={20} color="#6b7280" />
                <Text style={styles.infoLabelText}>First Name</Text>
              </View>
              <Text style={styles.infoValue}>{firstName} </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <MaterialIcons name="person-outline" size={20} color="#6b7280" />
                <Text style={styles.infoLabelText}>Last Name</Text>
              </View>
              <Text style={styles.infoValue}>{lastName}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <MaterialIcons name="alternate-email" size={20} color="#6b7280" />
                <Text style={styles.infoLabelText}>Username</Text>
              </View>
              <Text style={styles.infoValue}>{username}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <MaterialIcons name="email" size={20} color="#6b7280" />
                <Text style={styles.infoLabelText}>Email</Text>
              </View>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>
        </View>

        {/* Quick Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          
          {quickSettings.map((setting, index) => (
            <TouchableOpacity key={index} style={styles.settingCard}>
              <View style={[styles.settingIcon, { backgroundColor: setting.bgColor }]}>
                <MaterialIcons name={setting.icon} size={20} color={setting.color} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.logoutButtonText}>Signing out...</Text>
              </View>
            ) : (
              <>
                <MaterialIcons name="logout" size={20} color="#ef4444" />
                  <Text style={styles.logoutButtonText} onPress={() => {
                    router.push("/login")
                    
                }}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#009b7c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0f0f14',
  },
  profileInfo: {
    alignItems: 'center',
  },
  fullName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#009b7c',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emergencySection: {
    marginBottom: 30,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabelText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  logoutSection: {
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    borderColor: '#ef4444',
    borderTopColor: 'transparent',
    marginRight: 8,
  },
});