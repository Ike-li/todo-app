import React from "react";
import { Stack, Redirect, useRouter } from "expo-router";
import { Appbar } from "react-native-paper";
import { useAuthStore } from "../../src/stores/auth.store";
import { useAuth } from "../../src/hooks/useAuth";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { logout } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <Stack
      screenOptions={{
        header: ({ options, back }) => (
          <Appbar.Header>
            {back && <Appbar.BackAction onPress={() => router.back()} />}
            <Appbar.Content title={options.title || "TODO App"} />
            <Appbar.Action icon="account-circle" onPress={() => router.push("/(app)/profile")} />
            <Appbar.Action icon="logout" onPress={handleLogout} />
          </Appbar.Header>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "My Todos" }}
      />
      <Stack.Screen
        name="create"
        options={{ title: "Create Todo" }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Todo Details" }}
      />
      <Stack.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
    </Stack>
  );
}
