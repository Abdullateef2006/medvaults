import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Alert,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import api from '@/assets/api';

const QRCodeComponent = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/get-qrcode/');
      if (response.data?.qr_image_url) {
        setQrData(response.data);
      } else {
        setError("No QR code available.");
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to fetch QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveQRCode = async () => {
    if (!qrData?.qr_image_url) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Allow access to save the QR code.");
        return;
      }

      const localUri = FileSystem.documentDirectory + 'qr_code.png';
      const downloadRes = await FileSystem.downloadAsync(qrData.qr_image_url, localUri);

      await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
      Alert.alert("Success", "QR code saved to your gallery!");
    } catch (err) {
      console.error("Save Error:", err);
      Alert.alert("Error", "Failed to save QR code.");
    }
  };

  const shareQRCode = async () => {
    if (!qrData?.qr_image_url) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing not supported on this device.");
        return;
      }

      const localUri = FileSystem.documentDirectory + 'qr_code_share.png';
      const downloadRes = await FileSystem.downloadAsync(qrData.qr_image_url, localUri);

      await Sharing.shareAsync(downloadRes.uri, {
        dialogTitle: 'Share Your MedVault QR Code',
        mimeType: 'image/png',
      });
    } catch (err) {
      console.error("Share Error:", err);
      Alert.alert("Error", "Failed to share QR code.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009b7c" />
        <Text style={styles.loadingText}>Loading QR Code...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <MaterialIcons name="error-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchQRCode} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* QR Code Section Header */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: '#f5f3ff' }]}>
            <MaterialIcons name="qr-code" size={20} color="#009b7c" />
          </View>
          <Text style={styles.sectionTitle}>Emergency QR Code</Text>
        </View>

        {qrData?.qr_image_url && (
          <>
            {/* QR Code Display */}
            <View style={styles.qrCard}>
              <Image
                source={{ uri: qrData.qr_image_url }}
                style={styles.qrImage}
                resizeMode="contain"
              />


              <Text style={styles.qrToken}>Token: {qrData.qr_token}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#009b7c' }]}
                onPress={saveQRCode}
              >
                <MaterialIcons name="save-alt" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Save to Device</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={shareQRCode}
              >
                <MaterialIcons name="share" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Share QR Code</Text>
              </TouchableOpacity>
            </View>

            {/* Notice */}
            <View style={styles.noticeCard}>
              <View style={styles.noticeIcon}>
                <MaterialIcons name="info" size={20} color="#3b82f6" />
              </View>
              <View style={styles.noticeContent}>
                <Text style={styles.noticeTitle}>QR Code Usage</Text>
                <Text style={styles.noticeText}>
                  This QR code contains your emergency medical information.
                  Share it with healthcare providers in case of emergency.
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f14',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0f0f14',
    padding: 24,
  },
  errorCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#009b7c',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  qrCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  qrToken: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
});

export default QRCodeComponent;