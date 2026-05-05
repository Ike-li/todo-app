import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { FAB, Searchbar, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useTodos } from "../../src/hooks/useTodos";
import { TodoItem } from "../../src/components/TodoItem";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { EmptyState } from "../../src/components/EmptyState";
import type { TodoResponse } from "@todo-app/shared";

export default function TodoListScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const router = useRouter();
  const { todosQuery, toggleTodo, deleteTodo, reorderTodos } = useTodos();

  const todos = todosQuery.data?.data || [];
  const isRefreshing = todosQuery.isFetching && !todosQuery.isLoading;

  const sortedTodos = [...todos].sort(
    (a: TodoResponse, b: TodoResponse) => (a.position ?? 0) - (b.position ?? 0)
  );

  const filteredTodos = sortedTodos.filter((todo: TodoResponse) => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = todo.title.toLowerCase().includes(query);
      const matchesDescription = todo.description
        ?.toLowerCase()
        .includes(query);
      if (!matchesTitle && !matchesDescription) return false;
    }

    // Apply status filter
    if (filter === "active" && todo.completed) return false;
    if (filter === "completed" && !todo.completed) return false;

    return true;
  });

  const handleRefresh = useCallback(() => {
    todosQuery.refetch();
  }, [todosQuery]);

  const handleToggle = useCallback(
    (id: string) => {
      toggleTodo.mutate(id);
    },
    [toggleTodo]
  );

  const handlePress = useCallback(
    (id: string) => {
      router.push(`/(app)/${id}`);
    },
    [router]
  );

  const handleCreate = useCallback(() => {
    router.push("/(app)/create");
  }, [router]);

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const prev = filteredTodos[index - 1];
      const curr = filteredTodos[index];
      reorderTodos.mutate([
        { id: curr.id, position: prev.position ?? index - 1 },
        { id: prev.id, position: curr.position ?? index },
      ]);
    },
    [filteredTodos, reorderTodos]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= filteredTodos.length - 1) return;
      const curr = filteredTodos[index];
      const next = filteredTodos[index + 1];
      reorderTodos.mutate([
        { id: curr.id, position: next.position ?? index + 1 },
        { id: next.id, position: curr.position ?? index },
      ]);
    },
    [filteredTodos, reorderTodos]
  );

  if (todosQuery.isLoading) {
    return <LoadingSpinner message="Loading your todos..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Searchbar
          placeholder="Search todos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        <SegmentedButtons
          value={filter}
          onValueChange={(value) =>
            setFilter(value as "all" | "active" | "completed")
          }
          buttons={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Done" },
          ]}
          style={styles.filterButtons}
        />
      </View>

      {filteredTodos.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching todos" : "No todos yet"}
          description={
            searchQuery
              ? "Try a different search term"
              : "Create your first todo to get started!"
          }
          actionLabel={searchQuery ? undefined : "Create Todo"}
          onAction={searchQuery ? undefined : handleCreate}
        />
      ) : (
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TodoItem
              todo={item}
              onToggle={handleToggle}
              onPress={handlePress}
              onMoveUp={index > 0 ? () => handleMoveUp(index) : undefined}
              onMoveDown={index < filteredTodos.length - 1 ? () => handleMoveDown(index) : undefined}
              testID={`todo-item-${item.id}`}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreate}
        testID="create-fab"
        label="New Todo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterButtons: {
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
