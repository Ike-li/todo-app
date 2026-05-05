import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTodos } from "../../src/hooks/useTodos";
import { TodoForm } from "../../src/components/TodoForm";
import type { TodoCreate } from "@todo-app/shared";

export default function CreateTodoScreen() {
  const router = useRouter();
  const { createTodo } = useTodos();

  const handleSubmit = async (data: TodoCreate) => {
    await createTodo.mutateAsync(data);
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <TodoForm
        onSubmit={handleSubmit}
        isLoading={createTodo.isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
