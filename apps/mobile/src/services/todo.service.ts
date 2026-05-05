import { apiClient } from "./api-client";
import type {
  TodoCreate,
  TodoUpdate,
  TodoResponse,
  CategoryCreate,
  CategoryResponse,
  TagCreate,
  TagResponse,
} from "@todo-app/shared";

interface TodoListResponse {
  data: TodoResponse[];
  total: number;
  page: number;
  limit: number;
}

// --- Todos ---

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

// --- Categories ---

export async function fetchCategories(): Promise<CategoryResponse[]> {
  return apiClient.get<CategoryResponse[]>("/categories");
}

export async function createCategory(
  input: CategoryCreate
): Promise<CategoryResponse> {
  return apiClient.post<CategoryResponse>("/categories", input);
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryCreate>
): Promise<CategoryResponse> {
  return apiClient.patch<CategoryResponse>(`/categories/${id}`, input);
}

export async function deleteCategory(id: string): Promise<void> {
  return apiClient.delete<void>(`/categories/${id}`);
}

// --- Sub-tasks ---

export async function fetchSubTasks(todoId: string): Promise<TodoResponse[]> {
  return apiClient.get<TodoResponse[]>(`/todos/${todoId}/subtasks`);
}

export async function createSubTask(
  parentId: string,
  input: Omit<TodoCreate, "parentId">
): Promise<TodoResponse> {
  return apiClient.post<TodoResponse>("/todos", { ...input, parentId });
}

// --- Reorder ---

export async function reorderTodos(items: { id: string; position: number }[]): Promise<void> {
  return apiClient.patch<void>("/todos/reorder", { items });
}

// --- Tags ---

export async function fetchTags(): Promise<TagResponse[]> {
  return apiClient.get<TagResponse[]>("/tags");
}

export async function createTag(input: TagCreate): Promise<TagResponse> {
  return apiClient.post<TagResponse>("/tags", input);
}

export async function deleteTag(id: string): Promise<void> {
  return apiClient.delete<void>(`/tags/${id}`);
}
