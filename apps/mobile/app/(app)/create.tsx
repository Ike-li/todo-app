import React from "react";
import { ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useTodos } from "../../src/hooks/useTodos";
import { TodoForm } from "../../src/components/TodoForm";
import type { TodoCreate } from "@todo-app/shared";

export default function CreateTodoScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { createTodo } = useTodos();

  const handleSubmit = async (data: TodoCreate) => {
    await createTodo.mutateAsync(data);
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <TodoForm
        onSubmit={handleSubmit}
        isLoading={createTodo.isPending}
      />
    </ScrollView>
  );
}
