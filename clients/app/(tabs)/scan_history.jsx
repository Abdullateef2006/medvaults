import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import api from '../../assets/api';

const ScanHistoryScreen = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const res = await api.get('/your_scan_history/');
      // Sort scans by created_at in descending order (newest first)
      const sortedScans = [...res.data].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setScans(sortedScans);
    } catch (err) {
      console.error('Error fetching scan history:', err);
      Alert.alert('Error', 'Failed to load scan history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchScanHistory();
  };

  const getRiskLevelColor = (riskLevel) => {
    if (!riskLevel) return '#6b7280'; // Default for no risk
    const lowerCaseRisk = riskLevel.toLowerCase();
    if (lowerCaseRisk.includes('high')) return '#ef4444';
    if (lowerCaseRisk.includes('medium')) return '#f59e0b';
    if (lowerCaseRisk.includes('low')) return '#10b981';
    return '#6b7280'; // Default color
  };

  const formatRiskLevelText = (riskLevel) => {
    if (!riskLevel) return 'No risk detected';
    if (riskLevel.includes('there are no allergy')) return 'No risk detected';
    return riskLevel;
  };

  const renderScanItem = ({ item }) => (
    <View style={styles.scanCard}>
      <View style={styles.scanHeader}>
        <Text style={styles.scanFoodName}>{item.food_name}</Text>
        <View style={[styles.riskBadge, { backgroundColor: getRiskLevelColor(item.risk_level) }]}>
          <Text style={styles.riskBadgeText}>
            {formatRiskLevelText(item.risk_level)}
          </Text>
        </View>
      </View>

      {item.food_image && (
        <Image 
          source={{ uri: item.food_image }} 
          style={styles.foodImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.scanDetails}>
        {item.detected_allergen && (
          <View style={styles.detailRow}>
            <MaterialIcons name="warning" size={18} color="#ef4444" />
            <Text style={styles.detailText}>
              Detected: {item.detected_allergen}
            </Text>
          </View>
        )}



        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={18} color="#6b7280" />
          <Text style={styles.detailText}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009b7c" />
        <Text style={styles.loadingText}>Loading scan history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Scan History</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#009b7c" />
          ) : (
            <Ionicons name="refresh" size={20} color="#009b7c" />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={scans}
        renderItem={renderScanItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="info-outline" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>No scan history found</Text>
            <Text style={styles.emptySubtext}>Scan some food to see your history here</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f14',
  },
  loadingText: {
    color: '#009b7c',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#0f0f14',
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
    marginHorizontal: 16,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  scanCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanFoodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  riskBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  foodImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#374151',
  },
  scanDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ScanHistoryScreen;