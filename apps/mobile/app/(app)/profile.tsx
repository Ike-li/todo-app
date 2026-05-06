import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Share } from "react-native";
import { Card, Text, Divider, Button, List, useTheme, type MD3Theme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { useTodos } from "../../src/hooks/useTodos";
import { localUser } from "../../src/services/local-data";
import type { TodoResponse } from "@todo-app/shared";

export default function ProfileScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { logout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("Unknown");
  const { todos } = useTodos();
  const totalCount = todos.length;
  const completedCount = todos.filter((t: TodoResponse) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  useEffect(() => {
    localUser.getMe().then((user) => {
      if (user) {
        setUserName(user.name || "User");
        setUserEmail(user.email);
      }
    });
  }, []);

  const email = userEmail;
  const name = userName;

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleExport = async () => {
    const exportData = todos.map((t: TodoResponse) => ({
      title: t.title,
      description: t.description,
      completed: t.completed,
      priority: t.priority,
      dueDate: t.dueDate,
      category: t.category?.name,
      tags: t.tags?.map((tg: { tag: { name: string } }) => tg.tag.name),
      createdAt: t.createdAt,
    }));
    const json = JSON.stringify(exportData, null, 2);
    try {
      await Share.share({ message: json, title: 'My Todos' });
    } catch {
      // User cancelled share
    }
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

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Manage
          </Text>
          <Divider style={styles.divider} />
          <List.Item
            title="Categories"
            description="Organize your todos with categories"
            left={(props) => <List.Icon {...props} icon="tag-multiple" />}
            onPress={() => router.push("/(app)/categories")}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            accessibilityLabel="Manage categories"
          />
          <Divider />
          <List.Item
            title="Tags"
            description="Label your todos with tags"
            left={(props) => <List.Icon {...props} icon="tag" />}
            onPress={() => router.push("/(app)/tags")}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            accessibilityLabel="Manage tags"
          />
          <Divider />
          <List.Item
            title="Export Todos"
            description={`Export ${totalCount} todos as JSON`}
            left={(props) => <List.Icon {...props} icon="export" />}
            onPress={handleExport}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            accessibilityLabel="Export todos"
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.signOutButton}
        buttonColor={colors.error}
        icon="logout"
        testID="sign-out-button"
        accessibilityLabel="Sign out"
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const createStyles = (colors: MD3Theme['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: colors.onPrimary,
      fontWeight: "bold",
    },
    name: {
      textAlign: "center",
      fontWeight: "bold",
    },
    email: {
      textAlign: "center",
      color: colors.onSurfaceVariant,
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
      color: colors.onSurfaceVariant,
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
