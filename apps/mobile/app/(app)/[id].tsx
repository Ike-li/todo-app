import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Button,
  Checkbox,
  Card,
  Chip,
  Divider,
  IconButton,
  TextInput,
  ProgressBar,
  useTheme,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTodo, useTodos, useSubTasks } from "../../src/hooks/useTodos";
import { TodoForm } from "../../src/components/TodoForm";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { Alert } from "react-native";
import type { TodoCreate, TodoUpdate, TodoResponse } from "@todo-app/shared";

const PRIORITY_COLORS: Record<string, string> = {
  NONE: "#999",
  LOW: "#4caf50",
  MEDIUM: "#ff9800",
  HIGH: "#f44336",
  URGENT: "#9c27b0",
};

const PRIORITY_LABELS: Record<string, string> = {
  NONE: "None",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export default function TodoDetailScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const todoQuery = useTodo(id!);
  const { updateTodo, toggleTodo, deleteTodo } = useTodos();
  const { subTasksQuery, addSubTask } = useSubTasks(id);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSubTask, setShowAddSubTask] = useState(false);
  const [subTaskTitle, setSubTaskTitle] = useState("");

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
      priority: data.priority,
      dueDate: data.dueDate || null,
      categoryId: data.categoryId || null,
      tags: data.tags,
      parentId: data.parentId || null,
    };
    await updateTodo.mutateAsync({ id: todo.id, input: updateData });
    setIsEditing(false);
    todoQuery.refetch();
  };

  const handleAddSubTask = async () => {
    if (!subTaskTitle.trim()) return;
    await addSubTask.mutateAsync({ title: subTaskTitle.trim() });
    setSubTaskTitle("");
    setShowAddSubTask(false);
    todoQuery.refetch();
  };

  const handleToggleSubTask = async (subTaskId: string) => {
    await toggleTodo.mutateAsync(subTaskId);
    todoQuery.refetch();
  };

  const subTasks: TodoResponse[] = subTasksQuery.data || [];
  const completedSubTasks = subTasks.filter((s) => s.completed).length;

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
    // Extract tag names from the tags relation
    const tagNames = todo.tags
      ? todo.tags.map((t: { tag: { name: string } }) => t.tag.name)
      : [];

    return (
      <ScrollView style={styles.container}>
        <TodoForm
          onSubmit={handleUpdate}
          isLoading={updateTodo.isPending}
          excludeTodoId={todo.id}
          initialValues={{
            title: todo.title,
            description: todo.description || undefined,
            priority: todo.priority !== "NONE" ? todo.priority : undefined,
            dueDate: todo.dueDate
              ? new Date(todo.dueDate).toISOString().split("T")[0]
              : undefined,
            categoryId: todo.categoryId || undefined,
            tags: tagNames,
            parentId: todo.parentId || undefined,
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

  const showPriority = todo.priority && todo.priority !== "NONE";

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

            {showPriority && (
              <Chip
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor:
                      PRIORITY_COLORS[todo.priority] + "20",
                  },
                ]}
                textStyle={{
                  color: PRIORITY_COLORS[todo.priority],
                  fontWeight: "bold",
                }}
              >
                {PRIORITY_LABELS[todo.priority]}
              </Chip>
            )}
          </View>

          {todo.description && (
            <Text variant="bodyLarge" style={styles.description}>
              {todo.description}
            </Text>
          )}

          {/* Category */}
          {todo.category && (
            <View style={styles.categoryRow}>
              <Text variant="labelMedium" style={styles.label}>
                Category:
              </Text>
              <Chip
                icon="folder"
                style={styles.categoryChip}
              >
                {todo.category.name}
              </Chip>
            </View>
          )}

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text variant="labelMedium" style={styles.label}>
                Tags:
              </Text>
              <View style={styles.tagsRow}>
                {todo.tags.map(
                  (t: { tag: { id: string; name: string } }) => (
                    <Chip
                      key={t.tag.id}
                      icon="tag"
                      style={styles.tagChip}
                    >
                      {t.tag.name}
                    </Chip>
                  )
                )}
              </View>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.meta}>
            <Text variant="bodySmall" style={styles.metaText}>
              Status: {todo.completed ? "Completed" : "Active"}
            </Text>
            {todo.dueDate && (
              <Text variant="bodySmall" style={styles.metaText}>
                Due:{" "}
                {new Date(todo.dueDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            )}
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
          textColor={colors.error}
          style={[styles.deleteButton, { borderColor: colors.error }]}
          icon="delete"
        >
          Delete
        </Button>
      </View>

      {/* Sub-tasks section */}
      <Card style={styles.subTasksCard}>
        <Card.Content>
          <View style={styles.subTasksHeader}>
            <Text variant="titleMedium">Sub-tasks</Text>
            {subTasks.length > 0 && (
              <Text variant="bodySmall" style={styles.subTasksProgress}>
                {completedSubTasks}/{subTasks.length} completed
              </Text>
            )}
          </View>

          {subTasks.length > 0 && (
            <ProgressBar
              progress={subTasks.length > 0 ? completedSubTasks / subTasks.length : 0}
              style={styles.progressBar}
            />
          )}

          {subTasksQuery.isLoading ? (
            <LoadingSpinner message="Loading sub-tasks..." />
          ) : subTasks.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptySubTasks}>
              No sub-tasks yet.
            </Text>
          ) : (
            subTasks.map((subTask: TodoResponse) => (
              <View key={subTask.id} style={styles.subTaskRow}>
                <Checkbox
                  status={subTask.completed ? "checked" : "unchecked"}
                  onPress={() => handleToggleSubTask(subTask.id)}
                />
                <Text
                  style={[
                    styles.subTaskTitle,
                    subTask.completed && styles.subTaskCompleted,
                  ]}
                  onPress={() => router.push(`/${subTask.id}`)}
                >
                  {subTask.title}
                </Text>
              </View>
            ))
          )}

          {showAddSubTask ? (
            <View style={styles.addSubTaskRow}>
              <TextInput
                placeholder="Sub-task title"
                value={subTaskTitle}
                onChangeText={setSubTaskTitle}
                mode="outlined"
                dense
                style={styles.subTaskInput}
                onSubmitEditing={handleAddSubTask}
                returnKeyType="done"
                disabled={addSubTask.isPending}
              />
              <IconButton
                icon="check"
                mode="contained"
                onPress={handleAddSubTask}
                disabled={addSubTask.isPending || !subTaskTitle.trim()}
                size={20}
              />
              <IconButton
                icon="close"
                onPress={() => {
                  setShowAddSubTask(false);
                  setSubTaskTitle("");
                }}
                size={20}
              />
            </View>
          ) : (
            <Button
              mode="text"
              icon="plus"
              onPress={() => setShowAddSubTask(true)}
              style={styles.addSubTaskButton}
            >
              Add Sub-task
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      margin: 16,
    },
    headerRow: {
      marginBottom: 16,
      gap: 8,
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
    priorityChip: {
      alignSelf: "flex-start",
    },
    description: {
      marginBottom: 16,
      lineHeight: 24,
    },
    categoryRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 8,
    },
    label: {
      opacity: 0.6,
    },
    categoryChip: {
      alignSelf: "flex-start",
    },
    tagsSection: {
      marginBottom: 12,
      gap: 6,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    tagChip: {
      marginRight: 0,
    },
    divider: {
      marginVertical: 12,
    },
    meta: {
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
    subTasksCard: {
      marginHorizontal: 16,
      marginBottom: 16,
    },
    subTasksHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    subTasksProgress: {
      opacity: 0.6,
    },
    progressBar: {
      marginBottom: 12,
      height: 6,
      borderRadius: 3,
    },
    emptySubTasks: {
      opacity: 0.5,
      marginBottom: 8,
    },
    subTaskRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 2,
    },
    subTaskTitle: {
      flex: 1,
      fontSize: 15,
    },
    subTaskCompleted: {
      textDecorationLine: "line-through",
      opacity: 0.5,
    },
    addSubTaskRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 4,
    },
    subTaskInput: {
      flex: 1,
    },
    addSubTaskButton: {
      marginTop: 8,
      alignSelf: "flex-start",
    },
  });
