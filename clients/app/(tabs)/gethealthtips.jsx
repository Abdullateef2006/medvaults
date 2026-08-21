import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import api from "@/assets/api";

const { width } = Dimensions.get('window');

const HealthTipsScreen = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const fetchHealthTips = async () => {
    setLoading(true);
    setError(null);
    setHasGenerated(true);

    try {
      const response = await api.post("/api/generate-health-tips/");

      if (response.data?.tips && response.data.tips.length > 0) {
        setTips(response.data.tips);
      } else {
        setError("No tips available at the moment.");
      }
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setError("Failed to fetch health tips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Health Tips</Text>
          <Text style={styles.headerSubtitle}>Personalized advice based on your medical profile</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: 'rgba(0, 155, 124, 0.2)' }]}>
          <MaterialIcons name="auto-awesome" size={24} color="#009b7c" />
        </View>
      </View>

      {!hasGenerated && !loading && (
        <View style={styles.emptyState}>
          <MaterialIcons name="medical-information" size={64} color="#374151" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Get personalized health recommendations based on your emergency profile.</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009b7c" />
          <Text style={styles.loadingText}>Analyzing your profile...</Text>
        </View>
      ) : (
        <FlatList
          data={tips}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, index }) => (
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Text style={styles.tipNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{item}</Text>
            </View>
          )}
          ListFooterComponent={
            error ? (
              <View style={styles.errorCard}>
                <MaterialIcons name="error-outline" size={24} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.generateButton} 
          onPress={fetchHealthTips}
          disabled={loading}
        >
          <MaterialIcons name={hasGenerated ? "refresh" : "generating-tokens"} size={20} color="#fff" />
          <Text style={styles.generateButtonText}>
            {hasGenerated ? "Regenerate Tips" : "Generate Health Tips"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HealthTipsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#0f0f14',
  },
  headerContent: {
    flex: 1,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#009b7c',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  tipCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#374151',
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 155, 124, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  tipNumber: {
    color: '#009b7c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tipText: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 16,
    lineHeight: 24,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(15, 15, 20, 0.9)',
  },
  generateButton: {
    backgroundColor: '#009b7c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
});
