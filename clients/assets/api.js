// api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router } from "expo-router";

// Dynamically retrieve local IP from Expo Constants (or fallback to EXPO_PUBLIC_API_URL / localhost)
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  const ip = hostUri ? hostUri.split(":")[0] : "127.0.0.1";
  return `http://${ip}:8001/`;
};

export const BASE_URL = getBaseUrl();
console.log("[API] Connecting to Backend Base URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = await AsyncStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}token/refresh/`, {
            refresh: refresh,
          });
          await AsyncStorage.setItem("access_token", res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (err) {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          console.log(err);
          router.replace("/login");
        }
      } else {
        await AsyncStorage.removeItem("access_token");
        router.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
