import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import api from '@/assets/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from "@/components/ui/Loader"
import { sendEmergencyAlert } from "@/components/Emergency";

const { width, height } = Dimensions.get('window');

function EmergencyProfileScreen() {
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  
  useEffect(() => {
    setTimeout(() => {
      const fetchProfile = async () => {
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) {
            Alert.alert(
              'You must be logged in to access this page',
              'Please log in to continue.',
              [
                // { text: 'Cancel', style: 'cancel' },
                { text: 'Login here', onPress: () => router.push('/login') },
              ]
            );
            return;
          }
  
          const res = await api.get('api/emergency-profile/');
          setProfile(res.data);
        } catch (error) {
          console.error('Profile fetch failed:', error);
          Alert.alert('Error', 'Failed to load profile');
        } finally {
          setLoading(false);
        }
      };
  
      fetchProfile();
  
    
    }, 3000);
     }, []);

  const handleCallEmergencyContact = () => {
    if (!profile) return;
    Alert.alert(
      'Call Emergency Contact',
      `Call ${profile.emergency_contact_name} at ${profile.emergency_contact_phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log(profile) },
      ]
    );
  };

  const handleGenerateQR = () => {
    setIsGeneratingQR(true);
    setTimeout(() => {
      setIsGeneratingQR(false);
      Alert.alert('QR Code Generated', 'QR code created and saved.');
    }, 2000);
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Share with healthcare professionals.');
  };

  if (loading) return <Loader message="Loading your medical records..." />  ;
  if (!profile) return <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>No emergency profile found.</Text>;

  const medicalSections = [
    {
      title: 'Blood & Genetics',
      icon: 'bloodtype',
      color: '#ef4444',
      bgColor: '#fef2f2',
      items: [
        { label: 'Blood Type', value: profile.blood_type, icon: 'opacity' },
        { label: 'Genotype', value: profile.genotype, icon: 'science' },
        { label: 'Weight', value: `${profile.weight} kg`, icon: 'monitor-weight' },
      ],
    },
    {
      title: 'Medical Conditions',
      icon: 'medical-services',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      items: [
        { label: 'Allergies', value: profile.allergies, icon: 'warning', multiline: true },
        { label: 'Conditions', value: profile.conditions, icon: 'healing', multiline: true },
        { label: 'Medications', value: profile.medications, icon: 'medication', multiline: true },
      ],
    },
    {
      title: 'Emergency Contact',
      icon: 'contact-phone',
      color: '#10b981',
      bgColor: '#f0fdf4',
      items: [
        { label: 'Contact Name', value: profile.emergency_contact_name, icon: 'person' },
        { label: 'Phone Number', value: profile.emergency_contact_phone, icon: 'phone', actionable: true },
      ],
    },
    {
      title: 'Health History',
      icon: 'history',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      items: [
        { label: 'Vaccinations', value: profile.vaccination_history, icon: 'vaccines', multiline: true },
      ],
    },
    {
      title: 'Lifestyle',
      icon: 'fitness-center',
      color: '#009b7c',
      bgColor: '#f5f3ff',
      items: [
        { label: 'Dietary Restrictions', value: profile.dietary_restrictions, icon: 'restaurant' },
        { label: 'Smoking Status', value: profile.smoking_status, icon: 'smoke-free' },
        { label: 'Alcohol Consumption', value: profile.alcohol_consumption, icon: 'local-bar' },
        { label: 'Physical Activity', value: profile.physical_activity_level, icon: 'directions-run' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f14" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            router.back()
            }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Emergency Profile</Text>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/(tabs)')}>
              <MaterialIcons name="dashboard" size={20} color="#009b7c" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/health_setup')}>
              <MaterialIcons name="edit" size={20} color="#009b7c" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <MaterialIcons name="share" size={20} color="#009b7c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.alertBanner}>
          <View style={styles.alertIcon}>
            <MaterialIcons name="emergency" size={24} color="#fff" />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Emergency Medical Information</Text>
            <Text style={styles.alertSubtitle}>Critical health data for emergency responders</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10b981' }]} onPress={sendEmergencyAlert}>
            <MaterialIcons name="phone" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Call Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#009b7c' }]}
            onPress={handleGenerateQR}
            disabled={isGeneratingQR}
          >
            {isGeneratingQR ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.actionButtonText}>Generating...</Text>
              </View>
            ) : (
              <>
                <MaterialIcons name="qr-code" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Generate QR</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Medical Info Sections */}
        {medicalSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: section.bgColor }]}>
                <MaterialIcons name={section.icon} size={20} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoLabel}>
                    <MaterialIcons name={item.icon} size={18} color="#6b7280" />
                    <Text style={styles.infoLabelText}>{item.label}</Text>
                  </View>
                  {item.actionable && (
                    <TouchableOpacity style={styles.actionIcon} onPress={handleCallEmergencyContact}>
                      <MaterialIcons name="phone" size={18} color="#10b981" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.infoValue, item.multiline && styles.infoValueMultiline]}>
                  {item.value || 'Not provided'}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <MaterialIcons name="info" size={20} color="#3b82f6" />
          </View>
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Important Notice</Text>
            <Text style={styles.noticeText}>
              This information is for emergency use only. Always consult with healthcare professionals. Keep this profile up to date.
            </Text>
          </View>
        </View>

        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <MaterialIcons name="schedule" size={16} color="#6b7280" />
          <Text style={styles.lastUpdatedText}>Last updated: {new Date().toLocaleDateString()}</Text>
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
    marginBottom: 24,
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    borderTopColor: 'transparent',
    marginRight: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  actionIcon: {
    padding: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    lineHeight: 20,
  },
  infoValueMultiline: {
    lineHeight: 22,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  noticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  // ... same styles as your original
});

export default EmergencyProfileScreen;
