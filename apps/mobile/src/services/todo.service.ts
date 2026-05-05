import { apiClient } from "./api-client";
import type { TodoCreate, TodoUpdate, TodoResponse } from "@todo-app/shared";

interface TodoListResponse {
  data: TodoResponse[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchTodos(page = 1, limit = 20): Promise<TodoListResponse> {
  return apiClient.get<TodoListResponse>(`/todos?page=${page}&limit=${limit}`);
}

export async function fetchTodo(id: string): Promise<TodoResponse> {
  return apiClient.get<TodoResponse>(`/todos/${id}`);
}

export async function createTodo(input: TodoCreate): Promise<TodoResponse> {
  return apiClient.post<TodoResponse>("/todos", input);
}

export async function updateTodo(
  id: string,
  input: TodoUpdate
): Promise<TodoResponse> {
  return apiClient.patch<TodoResponse>(`/todos/${id}`, input);
}

export async function deleteTodo(id: string): Promise<void> {
  return apiClient.delete<void>(`/todos/${id}`);
}

export async function toggleTodo(id: string): Promise<TodoResponse> {
  return apiClient.patch<TodoResponse>(`/todos/${id}/toggle`);
}
