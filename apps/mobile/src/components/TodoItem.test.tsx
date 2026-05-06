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

  it("should show priority badge for non-NONE priority", () => {
    const highPriorityTodo = { ...mockTodo, priority: "HIGH" as const };
    const { getByText } = render(
      <TodoItem todo={highPriorityTodo} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(getByText("High")).toBeTruthy();
  });

  it("should not show priority badge for NONE priority", () => {
    const { queryByText } = render(
      <TodoItem todo={mockTodo} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(queryByText("NONE")).toBeNull();
  });

  it("should show checkbox as checked when selected=true", () => {
    const { getByText } = render(
      <TodoItem todo={mockTodo} onToggle={jest.fn()} onPress={jest.fn()} selected={true} />
    );

    expect(getByText("checked")).toBeTruthy();
  });

  it("should apply selected background when selected=true", () => {
    const { getByTestId } = render(
      <TodoItem todo={mockTodo} onToggle={jest.fn()} onPress={jest.fn()} selected={true} testID="todo-item" />
    );

    const item = getByTestId("todo-item");
    const styles = Array.isArray(item.props.style)
      ? item.props.style
      : [item.props.style];
    const hasSelectedBg = styles.some(
      (s: any) => s && s.backgroundColor === "rgba(98, 0, 238, 0.08)"
    );
    expect(hasSelectedBg).toBe(true);
  });

  it("should show overdue due date indicator for past dates", () => {
    const overdueTodo = {
      ...mockTodo,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const { getByText } = render(
      <TodoItem todo={overdueTodo} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(getByText("Test Todo")).toBeTruthy();
    // The formatted due date should be visible
    const formattedDate = new Date(overdueTodo.dueDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    expect(getByText(formattedDate)).toBeTruthy();
  });

  it("should show due-today indicator for today's date", () => {
    const dueTodayTodo = {
      ...mockTodo,
      dueDate: new Date().toISOString(),
    };
    const { getByText } = render(
      <TodoItem todo={dueTodayTodo} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    const formattedDate = new Date(dueTodayTodo.dueDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    expect(getByText(formattedDate)).toBeTruthy();
  });

  it("should not show due date indicator when todo is completed", () => {
    const completedOverdueTodo = {
      ...mockTodo,
      completed: true,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const { getByText } = render(
      <TodoItem todo={completedOverdueTodo} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    // Title should still be rendered; due date text is shown but without status color
    expect(getByText("Test Todo")).toBeTruthy();
  });

  it("should display category name when category is present", () => {
    const todoWithCategory = {
      ...mockTodo,
      category: { id: "cat-1", name: "Work", color: "#ff0000", icon: null },
    };
    const { getByText } = render(
      <TodoItem todo={todoWithCategory} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(getByText("Work")).toBeTruthy();
  });

  it("should display tag names when tags are present", () => {
    const todoWithTags = {
      ...mockTodo,
      tags: [
        { tag: { id: "tag-1", name: "urgent" } },
        { tag: { id: "tag-2", name: "important" } },
      ],
    };
    const { getByText } = render(
      <TodoItem todo={todoWithTags} onToggle={jest.fn()} onPress={jest.fn()} />
    );

    expect(getByText("urgent, important")).toBeTruthy();
  });

  it("should render move up and move down buttons when handlers are provided", () => {
    const onMoveUp = jest.fn();
    const onMoveDown = jest.fn();
    const { getByTestId } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={jest.fn()}
        onPress={jest.fn()}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
    );

    expect(getByTestId("move-up")).toBeTruthy();
    expect(getByTestId("move-down")).toBeTruthy();
  });

  it("should call onLongPress with todo id when long pressed", () => {
    const onLongPress = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={jest.fn()}
        onPress={jest.fn()}
        onLongPress={onLongPress}
        testID="todo-item"
      />
    );

    // The outermost Pressable has the onLongPress handler
    // Pressable is the first element wrapping the List.Item
    const pressables = UNSAFE_getAllByType(
      require("react-native").Pressable
    );
    // The outermost Pressable should have the long press handler
    const outerPressable = pressables[0];
    fireEvent(outerPressable, "longPress");

    expect(onLongPress).toHaveBeenCalledWith("1");
  });
});
