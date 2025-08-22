import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { UserProvider } from '@/providers/UserProvider';


import { useColorScheme } from "@/hooks/useColorScheme";
import FloatingChatButton from "@/components/FloatingChatButton";
import ShakeDetector from "@/components/MyShakeComponent ";
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <>
      <ShakeDetector />
      <UserProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen options={{ headerShown: false }} name="register" />
          <Stack.Screen options={{ headerShown: false }} name="login" />
          <Stack.Screen options={{ headerShown: false }} name="food_scanner" />
          <Stack.Screen options={{ headerShown: false }} name="emergency-profile" />
          <Stack.Screen options={{ headerShown: false }} name="health_setup" />
          <Stack.Screen options={{ headerShown: false }} name="medibot" />
        </Stack>
      </UserProvider>

 
      <StatusBar style="light" />
      <FloatingChatButton />
    </>
    // </ThemeProvider>
  );
}
