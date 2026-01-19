import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../ignoreWarnings";

// Polyfill for react-native-swiper
if (!global.setImmediate) {
  global.setImmediate = ((fn: any, ...args: any[]) => global.setTimeout(fn, 0, ...args)) as any;
}
export const unstable_settings = {
  anchor: "(tabs)",
};

import { useEffect } from "react";
import { SyncManager } from "./services/SyncManager"; // Global Sync Manager

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize Background Sync Globally
  useEffect(() => {
    const unsub = SyncManager.init();
    return () => unsub();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,   // <-- hides the ugly black header everywhere
        }}
      >
        {/* Login Screen */}
        <Stack.Screen name="login" />

        {/* Dashboard Screen */}
        <Stack.Screen name="dashboard" />

        {/* Tabs Navigator */}
        <Stack.Screen name="(tabs)" />


      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
