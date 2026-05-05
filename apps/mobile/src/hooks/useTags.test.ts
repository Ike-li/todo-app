import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useTags } from "./useTags";
import * as todoService from "../services/todo.service";

jest.mock("../services/todo.service");

const mockTodoService = todoService as jest.Mocked<typeof todoService>;

const mockTags = [
  {
    id: "1",
    name: "urgent",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "important",
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

describe("useTags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("tagsQuery", () => {
    it("should fetch tags successfully", async () => {
      mockTodoService.fetchTags.mockResolvedValueOnce(mockTags);

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      expect(result.current.tagsQuery.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.tagsQuery.isSuccess).toBe(true);
      });

      expect(result.current.tagsQuery.data).toEqual(mockTags);
      expect(mockTodoService.fetchTags).toHaveBeenCalled();
    });

    it("should handle fetch error", async () => {
      mockTodoService.fetchTags.mockRejectedValueOnce(
        new Error("Network error")
      );

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.tagsQuery.isError).toBe(true);
      });

      expect(result.current.tagsQuery.error).toEqual(
        new Error("Network error")
      );
    });
  });

  describe("createTag", () => {
    it("should create a tag and invalidate the list", async () => {
      const newTag = {
        id: "3",
        name: "new-tag",
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
      };
      mockTodoService.createTag.mockResolvedValueOnce(newTag);

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createTag.mutateAsync({
          name: "new-tag",
        });
      });

      expect(mockTodoService.createTag).toHaveBeenCalledWith({
        name: "new-tag",
      });
    });
  });

  describe("deleteTag", () => {
    it("should delete a tag", async () => {
      mockTodoService.deleteTag.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteTag.mutateAsync("1");
      });

      expect(mockTodoService.deleteTag).toHaveBeenCalledWith("1");
    });
  });
});
