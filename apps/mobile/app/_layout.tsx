import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { useColorScheme } from "../components/useColorScheme";
import { LightColors, DarkColors } from "../constants/Colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { getToken } from "../src/services/api-client";
import { useAuthStore } from "../src/stores/auth.store";

export { ErrorBoundary } from "expo-router";

// Keep splash screen visible while checking auth
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const lightTheme = {
  ...MD3LightTheme,
  colors: LightColors,
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: DarkColors,
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isReady, setIsReady] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getToken();
        if (token) {
          setToken(token);
        }
      } catch {
        // Token check failed, user is not logged in
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    checkAuth();
  }, [setToken]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
