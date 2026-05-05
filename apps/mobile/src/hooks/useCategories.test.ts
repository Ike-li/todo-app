import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useCategories } from "./useCategories";
import * as todoService from "../services/todo.service";

jest.mock("../services/todo.service");

const mockTodoService = todoService as jest.Mocked<typeof todoService>;

const mockCategories = [
  {
    id: "1",
    name: "Work",
    color: "#ff0000",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Personal",
    color: "#00ff00",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe("useCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("categoriesQuery", () => {
    it("should fetch categories successfully", async () => {
      mockTodoService.fetchCategories.mockResolvedValueOnce(mockCategories);

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      expect(result.current.categoriesQuery.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.categoriesQuery.isSuccess).toBe(true);
      });

      expect(result.current.categoriesQuery.data).toEqual(mockCategories);
      expect(mockTodoService.fetchCategories).toHaveBeenCalled();
    });

    it("should handle fetch error", async () => {
      mockTodoService.fetchCategories.mockRejectedValueOnce(
        new Error("Network error")
      );

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.categoriesQuery.isError).toBe(true);
      });

      expect(result.current.categoriesQuery.error).toEqual(
        new Error("Network error")
      );
    });
  });

  describe("createCategory", () => {
    it("should create a category and invalidate the list", async () => {
      const newCategory = {
        id: "3",
        name: "Shopping",
        color: "#0000ff",
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
      };
      mockTodoService.createCategory.mockResolvedValueOnce(newCategory);

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createCategory.mutateAsync({
          name: "Shopping",
          color: "#0000ff",
        });
      });

      expect(mockTodoService.createCategory).toHaveBeenCalledWith({
        name: "Shopping",
        color: "#0000ff",
      });
    });
  });

  describe("deleteCategory", () => {
    it("should delete a category", async () => {
      mockTodoService.deleteCategory.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteCategory.mutateAsync("1");
      });

      expect(mockTodoService.deleteCategory).toHaveBeenCalledWith("1");
    });
  });
});
