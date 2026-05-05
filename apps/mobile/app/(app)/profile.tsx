import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Text, Divider, Button, List } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { useAuthStore } from "../../src/stores/auth.store";
import { useTodos } from "../../src/hooks/useTodos";
import type { TodoResponse } from "@todo-app/shared";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const { todosQuery } = useTodos();

  const todos: TodoResponse[] = todosQuery.data?.data || [];
  const totalCount = todos.length;
  const completedCount = todos.filter((t: TodoResponse) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  const payload = token ? decodeJwtPayload(token) : null;
  const email = (payload?.email as string) || "Unknown";
  const name = (payload?.name as string) || "User";

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text variant="headlineLarge" style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text variant="headlineSmall" style={styles.name}>
            {name}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {email}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Todo Stats
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {totalCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, styles.completedColor]}>
                {completedCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Completed
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, styles.pendingColor]}>
                {pendingCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Pending
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account
          </Text>
          <Divider style={styles.divider} />
          <List.Item
            title="Email"
            description={email}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Total Todos"
            description={`${totalCount} todos`}
            left={(props) => <List.Icon {...props} icon="format-list-bulleted" />}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.signOutButton}
        buttonColor="#d32f2f"
        icon="logout"
        testID="sign-out-button"
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    textAlign: "center",
    fontWeight: "bold",
  },
  email: {
    textAlign: "center",
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "bold",
  },
  statLabel: {
    color: "#666",
    marginTop: 4,
  },
  completedColor: {
    color: "#388e3c",
  },
  pendingColor: {
    color: "#f57c00",
  },
  signOutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
});
