import React from "react";
import { StyleSheet } from "react-native";
import { List, Checkbox, Text } from "react-native-paper";
import type { TodoResponse } from "@todo-app/shared";

interface TodoItemProps {
  todo: TodoResponse;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
  testID?: string;
}

export function TodoItem({ todo, onToggle, onPress, testID }: TodoItemProps) {
  const titleStyle = todo.completed
    ? [styles.title, styles.completed]
    : styles.title;

  return (
    <List.Item
      testID={testID}
      title={() => (
        <Text testID="todo-title" style={titleStyle} variant="bodyLarge">
          {todo.title}
        </Text>
      )}
      description={todo.description || undefined}
      onPress={() => onPress(todo.id)}
      left={() => (
        <Checkbox
          testID="todo-checkbox"
          status={todo.completed ? "checked" : "unchecked"}
          onPress={() => onToggle(todo.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
  },
  completed: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
});
