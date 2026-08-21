import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRef, useState, useEffect } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useUserData } from '@/hooks/useUserData';
import React from "react";
import api from "@/assets/api";



const { height, width } = Dimensions.get("window");

const carouselData = [
  {
    text: "Scan your meal for allergies",
    subtitle: "AI-powered food analysis",
    icon: <MaterialIcons name="scanner" size={40} color="#fff" />,
    gradient: ['#ff6b6b', '#ff8e8e'],
    backgroundColor: '#ff6b6b'
  },
  {
    text: "Share your QR code in emergency",
    subtitle: "Quick medical access",
    icon: <MaterialIcons name="qr-code" size={40} color="#fff" />,
    gradient: ['#009b7c', '#009b7c'],
    backgroundColor: '#009b7c'
  },
  {
    text: "Save for time in need",
    subtitle: "Emergency preparedness",
    icon: <MaterialIcons name="favorite" size={40} color="#fff" />,
    gradient: ['#f59e0b', '#fbbf24'],
    backgroundColor: '#f59e0b'
  },
];

// Removed hardcoded recentActivities

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const flatListRef = useRef(null);
  const router = useRouter()

  // Function to handle "My Health" card press
  const handleMyHealthPress = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      router.push("/emergency-profile");
    } else {
      router.push("/login");
    }
  };

    const { 
    username, 
    email, 
    fullName, 
    lastName,
    firstName,
    error 
  } = useUserData()


useEffect(() => {
  const checkTokenAndFetch = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      router.push("/login");
    } else {
      fetchActivities();
    }
  };
  checkTokenAndFetch();
}, []);

const fetchActivities = async () => {
  try {
    const response = await api.get('/api/recent-activities/');
    if (response.data && response.data.activities) {
      setRecentActivities(response.data.activities);
    } else {
      setRecentActivities(response.data || []);
    }
  } catch (error) {
    console.error("Error fetching recent activities:", error);
  } finally {
    setLoadingActivities(false);
  }
};

// Helper for time ago formatting
const timeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselData.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 50,
      }}
      style={{
        padding: 20,
        backgroundColor: "#0f0f14",
      }}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Good morning, {username}
          </Text>
          <Text style={styles.subtitle}>
            Stay healthy, stay safe 🌟
          </Text>
        </View>
        <TouchableOpacity style={styles.avatar}>
          <Ionicons name="notifications" size={24} color="white" />
          <View style={styles.onlineIndicator} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainActions}>
        <TouchableOpacity onPress={handleMyHealthPress} style={[styles.actionCard, { backgroundColor: '#1a365d' }]}>
          <View style={[styles.iconContainer, { backgroundColor: '#3182ce' }]}>
            <MaterialIcons name="health-and-safety" size={32} color="white" />
          </View>
          <Text style={styles.actionTitle}>My Health</Text>
          <Text style={styles.actionSubtitle}>View profile & records</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> router.push("/food_scanner")} style={[styles.actionCard, { backgroundColor: '#2d1b69' }]}>
          <View style={[styles.iconContainer, { backgroundColor: '#7c3aed' }]}>
            <Ionicons name="scan" size={32} color="white" />
          </View>
          <Text style={styles.actionTitle}>Scan With AI</Text>
          <Text style={styles.actionSubtitle}>Analyze food & medicine</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsContainer}
          contentContainerStyle={styles.quickActionsContent}
        >
          {[
            { title: "Notifications", color: "#ef4444", icon: "notifications" },
            { title: "Insurance", color: "#06b6d4", icon: "security" },
            { title: "Emergency", color: "#dc2626", icon: "local-hospital" },
            { title: "Energy Alert", color: "#65a30d", icon: "flash-on" }
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickAction, { backgroundColor: action.color }]}
            >
              <MaterialIcons name={action.icon} size={16} color="white" style={{ marginRight: 5 }} />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <FlatList
          ref={flatListRef}
          data={carouselData}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
            setCurrentIndex(index);
          }}
          renderItem={({ item, index }) => (
            <EnhancedCarouselCard data={carouselData} index={index} />
          )}
          keyExtractor={(item, index) => index.toString()}
          style={styles.carousel}
          getItemLayout={(data, index) => ({
            length: width - 40,
            offset: (width - 40) * index,
            index,
          })}
        />

        <View style={styles.pagination}>
          {carouselData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: currentIndex === index ? '#009b7c' : '#374151',
                  width: currentIndex === index ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        
        {loadingActivities ? (
          <Text style={{ color: '#9ca3af', textAlign: 'center', marginVertical: 20 }}>Loading activities...</Text>
        ) : recentActivities.length === 0 ? (
          <Text style={{ color: '#9ca3af', textAlign: 'center', marginVertical: 20 }}>No recent activities found.</Text>
        ) : (
          recentActivities.map((activity, index) => {
            // Support both old dummy format (if needed) and new backend format
            const iconName = activity.icon || (activity.iconBg ? "event" : "circle");
            // Determine icon color, fallback to teal
            const iconColor = activity.color || "#009b7c"; 
            // Create a slightly transparent background for the icon
            const iconBg = activity.iconBg || (iconColor + "20"); 
            
            return (
              <TouchableOpacity key={activity.id || index} style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: iconBg }]}>
                  {typeof activity.icon === 'object' ? (
                    activity.icon
                  ) : (
                    <MaterialIcons name={iconName} size={20} color={iconColor} />
                  )}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>{activity.description || activity.subtitle}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.timestamp ? timeAgo(activity.timestamp) : activity.time}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function EnhancedCarouselCard(props) {
  const { data, index } = props;
  const item = data[index];
  
  return (
    <TouchableOpacity
      style={[
        styles.carouselCard,
        { backgroundColor: item.backgroundColor }
      ]}
    >
      <View style={styles.carouselContent}>
        <View style={styles.carouselIcon}>
          {item.icon}
        </View>
        <View style={styles.carouselText}>
          <Text style={styles.carouselTitle}>
            {item.text}
          </Text>
          <Text style={styles.carouselSubtitle}>
            {item.subtitle}
          </Text>
        </View>
      </View>
      <MaterialIcons name="arrow-forward" size={24} color="rgba(255,255,255,0.7)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  avatar: {
    height: 48,
    width: 48,
    backgroundColor: "#6366f1",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#0f0f14',
  },
  mainActions: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  viewAllText: {
    color: "#009b7c",
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsContainer: {
    marginTop: 15,
  },
  quickActionsContent: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  carousel: {
    marginBottom: 15,
  },
  carouselCard: {
    width: width - 40,
    height: 120,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  carouselContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  carouselIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  carouselText: {
    flex: 1,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  carouselSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  activitySubtitle: {
    color: "#9ca3af",
    fontSize: 13,
  },
  activityTime: {
    color: "#6b7280",
    fontSize: 12,
  },
});
