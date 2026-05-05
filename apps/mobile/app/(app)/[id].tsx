import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, Checkbox, Card } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTodo, useTodos } from "../../src/hooks/useTodos";
import { TodoForm } from "../../src/components/TodoForm";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import type { TodoCreate, TodoUpdate } from "@todo-app/shared";

export default function TodoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const todoQuery = useTodo(id!);
  const { updateTodo, toggleTodo, deleteTodo } = useTodos();
  const [isEditing, setIsEditing] = useState(false);

  if (todoQuery.isLoading) {
    return <LoadingSpinner message="Loading todo..." />;
  }

  if (todoQuery.error || !todoQuery.data) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall">Todo not found</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const todo = todoQuery.data;

  const handleUpdate = async (data: TodoCreate) => {
    const updateData: TodoUpdate = {
      title: data.title,
      description: data.description || null,
    };
    await updateTodo.mutateAsync({ id: todo.id, input: updateData });
    setIsEditing(false);
    todoQuery.refetch();
  };

  const handleToggle = async () => {
    await toggleTodo.mutateAsync(todo.id);
    todoQuery.refetch();
  };

  const handleDelete = () => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTodo.mutateAsync(todo.id);
          router.back();
        },
      },
    ]);
  };

  if (isEditing) {
    return (
      <ScrollView style={styles.container}>
        <TodoForm
          onSubmit={handleUpdate}
          isLoading={updateTodo.isPending}
          initialValues={{
            title: todo.title,
            description: todo.description || undefined,
          }}
        />
        <Button
          mode="text"
          onPress={() => setIsEditing(false)}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Checkbox
                status={todo.completed ? "checked" : "unchecked"}
                onPress={handleToggle}
              />
              <Text
                variant="headlineSmall"
                style={[
                  styles.title,
                  todo.completed && styles.completedTitle,
                ]}
              >
                {todo.title}
              </Text>
            </View>
          </View>

          {todo.description && (
            <Text variant="bodyLarge" style={styles.description}>
              {todo.description}
            </Text>
          )}

          <View style={styles.meta}>
            <Text variant="bodySmall" style={styles.metaText}>
              Status: {todo.completed ? "Completed" : "Active"}
            </Text>
            <Text variant="bodySmall" style={styles.metaText}>
              Created: {new Date(todo.createdAt).toLocaleDateString()}
            </Text>
            <Text variant="bodySmall" style={styles.metaText}>
              Updated: {new Date(todo.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => setIsEditing(true)}
          style={styles.editButton}
          icon="pencil"
        >
          Edit
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          textColor="#d32f2f"
          style={styles.deleteButton}
          icon="delete"
        >
          Delete
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
  },
  headerRow: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
    marginLeft: 8,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  description: {
    marginBottom: 16,
    lineHeight: 24,
  },
  meta: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    gap: 4,
  },
  metaText: {
    opacity: 0.6,
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    borderColor: "#d32f2f",
  },
  cancelButton: {
    margin: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginTop: 16,
  },
});
