import React, { useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import api from "@/assets/api"; // ✅ your centralized axios instance

const HealthTipsScreen = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealthTips = async () => {
    setLoading(true);
    setError(null);

    try {
      // 🚨 Ensure your JWT token is automatically added inside api.js interceptor
      const response = await api.post("/api/generate-health-tips/");

      if (response.data?.tips) {
        setTips(response.data.tips);
      } else {
        setError("No tips available.");
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
      <Text style={styles.header}>🩺 AI Health Tips</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
      ) : (
        <Button title="Get Health Tips" onPress={fetchHealthTips} />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={tips}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.tip}>• {item}</Text>}
        style={styles.list}
      />
    </View>
  );
};

export default HealthTipsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  list: { marginTop: 20 },
  tip: { fontSize: 16, marginBottom: 10, lineHeight: 22 },
  error: { color: "red", marginTop: 10 },
});
