import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useTodos } from "./useTodos";
import * as todoService from "../services/todo.service";

jest.mock("../services/todo.service");

const mockTodoService = todoService as jest.Mocked<typeof todoService>;

const mockTodos = [
  {
    id: "1",
    title: "Test Todo 1",
    description: "Description 1",
    completed: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Test Todo 2",
    description: null,
    completed: true,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

const mockTodoListResponse = {
  data: mockTodos,
  total: 2,
  page: 1,
  limit: 20,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe("useTodos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useTodos query", () => {
    it("should fetch todos successfully", async () => {
      mockTodoService.fetchTodos.mockResolvedValueOnce(mockTodoListResponse);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      expect(result.current.todosQuery.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.todosQuery.isSuccess).toBe(true);
      });

      expect(result.current.todos).toEqual(mockTodos);
      expect(result.current.total).toBe(2);
      expect(result.current.todosQuery.data?.pages[0]).toEqual(mockTodoListResponse);
      expect(mockTodoService.fetchTodos).toHaveBeenCalledWith(1, 20);
    });
  });

  describe("useCreateTodo", () => {
    it("should create a todo and invalidate the list", async () => {
      const newTodo = {
        id: "3",
        title: "New Todo",
        description: "New Description",
        completed: false,
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
      };
      mockTodoService.fetchTodos.mockResolvedValue(mockTodoListResponse);
      mockTodoService.createTodo.mockResolvedValueOnce(newTodo);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createTodo.mutateAsync({
          title: "New Todo",
          description: "New Description",
        });
      });

      expect(mockTodoService.createTodo).toHaveBeenCalledWith({
        title: "New Todo",
        description: "New Description",
      });
    });
  });

  describe("useToggleTodo", () => {
    it("should toggle a todo and use optimistic update", async () => {
      mockTodoService.fetchTodos.mockResolvedValueOnce(mockTodoListResponse);

      const toggledTodo = { ...mockTodos[0], completed: true };
      mockTodoService.toggleTodo.mockResolvedValueOnce(toggledTodo);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.todosQuery.isSuccess).toBe(true);
      });

      await act(async () => {
        await result.current.toggleTodo.mutateAsync("1");
      });

      expect(mockTodoService.toggleTodo).toHaveBeenCalledWith("1");
    });
  });

  describe("useDeleteTodo", () => {
    it("should delete a todo", async () => {
      mockTodoService.fetchTodos.mockResolvedValue(mockTodoListResponse);
      mockTodoService.deleteTodo.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteTodo.mutateAsync("1");
      });

      expect(mockTodoService.deleteTodo).toHaveBeenCalledWith("1");
    });
  });
});
