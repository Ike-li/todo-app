import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TodoItem } from "./TodoItem";

const mockTodo = {
  id: "1",
  title: "Test Todo",
  description: "Test Description",
  completed: false,
  priority: "NONE" as const,
  dueDate: null,
  position: 0,
  userId: "user-1",
  categoryId: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("TodoItem", () => {
  it("should render the todo title", () => {
    const { getByText } = render(
      <TodoItem todo={mockTodo} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(getByText("Test Todo")).toBeTruthy();
  });

  it("should render the todo description when present", () => {
    const { getByText } = render(
      <TodoItem todo={mockTodo} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(getByText("Test Description")).toBeTruthy();
  });

  it("should not render description when null", () => {
    const todoWithoutDesc = { ...mockTodo, description: null };
    const { queryByText } = render(
      <TodoItem todo={todoWithoutDesc} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(queryByText("Test Description")).toBeNull();
  });

  it("should show checkbox as unchecked when todo is not completed", () => {
    const { getByText } = render(
      <TodoItem todo={mockTodo} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(getByText("unchecked")).toBeTruthy();
  });

  it("should show checkbox as checked when todo is completed", () => {
    const completedTodo = { ...mockTodo, completed: true };
    const { getByText } = render(
      <TodoItem todo={completedTodo} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(getByText("checked")).toBeTruthy();
  });

  it("should call onToggle when checkbox is pressed", () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <TodoItem todo={mockTodo} onToggle={onToggle} onPress={jest.fn()} testID="todo-item" />
    );

    // Find and press the checkbox
    const checkbox = getByTestId("todo-checkbox");
    fireEvent.press(checkbox);

    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("should call onPress when the item is pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TodoItem todo={mockTodo} onToggle={jest.fn()} onPress={onPress} testID="todo-item" />
    );

    fireEvent.press(getByTestId("todo-item"));

    expect(onPress).toHaveBeenCalledWith("1");
  });

  it("should apply strikethrough style when completed", () => {
    const completedTodo = { ...mockTodo, completed: true };
    const { getByTestId } = render(
      <TodoItem todo={completedTodo} onToggle={jest.fn()} onPress={jest.fn()} testID="todo-item" />
    );

    const title = getByTestId("todo-title");
    const styles = Array.isArray(title.props.style)
      ? title.props.style
      : [title.props.style];
    const hasLineThrough = styles.some(
      (s: any) => s && s.textDecorationLine === "line-through"
    );
    expect(hasLineThrough).toBe(true);
  });
});
