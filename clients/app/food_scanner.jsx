import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import api from '@/assets/api';

const { width } = Dimensions.get('window');

const ScanFoodScreen = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('image'); // 'image' or 'text'
  const [foodName, setFoodName] = useState('');
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert("Permission required", "We need access to your photos to select images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const submitScan = async () => {
    if ((activeTab === 'image' && !image) || (activeTab === 'text' && !foodName.trim())) {
      Alert.alert("Missing Input", activeTab === 'image' 
        ? "Please select an image" 
        : "Please enter food name");
      return;
    }

    const formData = new FormData();
    if (activeTab === 'text') {
      formData.append("food_name", foodName);
    } else {
      formData.append("food_image", {
        uri: image.uri,
        name: "food.jpg",
        type: "image/jpeg",
      });
    }

    try {
      setLoading(true);
      const response = await api.post("/scan-food/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not scan food. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'check-circle';
      case 'medium': return 'warning';
      case 'high': return 'dangerous';
      default: return 'help';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Scanner</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'image' && styles.activeTab
          ]}
          onPress={() => setActiveTab('image')}
        >
          <MaterialIcons 
            name="photo-library" 
            size={20} 
            color={activeTab === 'image' ? '#009b7c' : '#6b7280'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'image' && styles.activeTabText
          ]}>
            Image Scan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'text' && styles.activeTab
          ]}
          onPress={() => setActiveTab('text')}
        >
          <MaterialIcons 
            name="text-fields" 
            size={20} 
            color={activeTab === 'text' ? '#009b7c' : '#6b7280'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'text' && styles.activeTabText
          ]}>
            Text Input
          </Text>
        </TouchableOpacity>
      </View>

      {/* Image Tab Content */}
      {activeTab === 'image' && (
        <View style={styles.tabContent}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <MaterialIcons 
              name={image ? "image" : "photo-library"} 
              size={24} 
              color="#009b7c" 
            />
            <Text style={styles.uploadButtonText}>
              {image ? "Change Image" : "Select Food Image"}
            </Text>
          </TouchableOpacity>

          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => setImage(null)}
              >
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Text Tab Content */}
      {activeTab === 'text' && (
        <View style={styles.tabContent}>
          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <MaterialIcons name="restaurant" size={20} color="#6b7280" />
              <Text style={styles.inputLabel}>FOOD NAME</Text>
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="e.g., Peanut Soup with bread"
              placeholderTextColor="#4b5563"
              value={foodName}
              onChangeText={setFoodName}
              multiline
            />
          </View>
          <Text style={styles.inputHint}>
            <MaterialIcons name="lightbulb" size={14} color="#f59e0b" /> 
            Be specific for better results
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.scanButton,
          ((activeTab === 'image' && !image) || 
           (activeTab === 'text' && !foodName.trim()) || 
           loading) && styles.scanButtonDisabled
        ]}
        onPress={submitScan}
        disabled={
          (activeTab === 'image' && !image) || 
          (activeTab === 'text' && !foodName.trim()) || 
          loading
        }
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MaterialIcons name="scanner" size={24} color="white" />
        )}
        <Text style={styles.scanButtonText}>
          {loading ? 'Analyzing...' : activeTab === 'image' ? 'Scan Image' : 'Analyze Text'}
        </Text>
      </TouchableOpacity>

      {/* Results Section */}
      {result && (
        <View style={styles.resultsSection}>
          <View style={styles.resultHeader}>
            <MaterialIcons 
              name={activeTab === 'image' ? "image-search" : "text-fields"} 
              size={24} 
              color="#10b981" 
            />
            <Text style={styles.resultTitle}>
              {activeTab === 'image' ? 'Image Analysis' : 'Text Analysis'}
            </Text>
          </View>

          <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
              <MaterialIcons name="restaurant" size={20} color="#3b82f6" />
              <Text style={styles.resultCardTitle}>DETECTED FOOD</Text>
            </View>
            <Text style={styles.foodName}>{result.food_name || 'Unknown Food'}</Text>
          </View>

          <View style={[styles.resultCard, { borderLeftColor: getRiskColor(result.risk_level) }]}>
            <View style={styles.resultCardHeader}>
              <MaterialIcons 
                name={getRiskIcon(result.risk_level)} 
                size={20} 
                color={getRiskColor(result.risk_level)} 
              />
              <Text style={styles.resultCardTitle}>RISK LEVEL</Text>
            </View>
            <View style={styles.riskContainer}>
              <Text style={[styles.riskLevel, { color: getRiskColor(result.risk_level) }]}>
                {result.risk_level?.toUpperCase() || 'UNKNOWN'}
              </Text>
              {/* <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence: </Text>
                <Text style={styles.confidenceValue}>
                  {result.confidence ? Math.round(result.confidence * 100) : 0}%
                </Text>
              </View> */}
            </View>
          </View>

          <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
              <MaterialIcons name="warning" size={20} color="#f59e0b" />
              <Text style={styles.resultCardTitle}>DETECTED ALLERGENS</Text>
            </View>
            <View style={styles.allergensContainer}>
              {result.detected_allergen?.split(', ').map((allergen, index) => (
                <View key={index} style={styles.allergenTag}>
                  <MaterialIcons name="report-problem" size={16} color="#ef4444" />
                  <Text style={styles.allergenText}>{allergen.trim()}</Text>
                </View>
              ))}
            </View>
            
          </View>
        </View>
      )}

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>
          {activeTab === 'image' ? '📸 Image Tips' : '📝 Text Tips'}
        </Text>
        <View style={styles.tipsList}>
          {activeTab === 'image' ? (
            <>
              <Text style={styles.tipItem}>• Use clear, well-lit food photos</Text>
              <Text style={styles.tipItem}>• Capture the entire dish</Text>
              <Text style={styles.tipItem}>• Avoid blurry or dark images</Text>
            </>
          ) : (
            <>
              <Text style={styles.tipItem}>• Include all ingredients</Text>
              <Text style={styles.tipItem}>• Specify cooking methods</Text>
              <Text style={styles.tipItem}>• Mention brands if relevant</Text>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerRightPlaceholder: {
    width: 44,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#111827',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#009b7c',
  },
  tabContent: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  inputField: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    padding: 0,
    marginTop: 4,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    color: '#f59e0b',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#009b7c',
    gap: 12,
  },
  uploadButtonText: {
    color: '#009b7c',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 250,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#009b7c',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 12,
    shadowColor: '#009b7c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  resultCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#374151',
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resultCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riskLevel: {
    fontSize: 16,
    fontWeight: '700',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  allergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 4,
  },
  allergenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  tipsSection: {
    paddingHorizontal: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  tipsList: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default ScanFoodScreen;