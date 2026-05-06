import {
  localTodos,
  localCategories,
  localTags,
  type LocalTodoResponse,
  type LocalCategoryResponse,
  type LocalTagResponse,
} from "./local-data";

interface TodoListResponse {
  data: LocalTodoResponse[];
  total: number;
  page: number;
  limit: number;
}

// --- Todos ---

export async function fetchTodos(page = 1, limit = 20): Promise<TodoListResponse> {
  return localTodos.getAll({ page, limit });
}

export async function fetchTodo(id: string): Promise<LocalTodoResponse> {
  return localTodos.getById(id);
}

export async function createTodo(input: {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string | null;
  categoryId?: string | null;
  tags?: string[];
}): Promise<LocalTodoResponse> {
  return localTodos.create(input);
}

export async function updateTodo(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    completed?: boolean;
    priority?: string;
    dueDate?: string | null;
    categoryId?: string | null;
    tags?: string[];
  }
): Promise<LocalTodoResponse> {
  return localTodos.update(id, input);
}

export async function deleteTodo(id: string): Promise<void> {
  return localTodos.delete(id);
}

export async function toggleTodo(id: string): Promise<LocalTodoResponse> {
  return localTodos.toggle(id);
}

// --- Categories ---

export async function fetchCategories(): Promise<LocalCategoryResponse[]> {
  return localCategories.getAll();
}

export async function createCategory(
  input: { name: string; color?: string | null; icon?: string | null }
): Promise<LocalCategoryResponse> {
  return localCategories.create(input);
}

export async function deleteCategory(id: string): Promise<void> {
  return localCategories.delete(id);
}

// --- Sub-tasks ---

export async function fetchSubTasks(parentId: string): Promise<LocalTodoResponse[]> {
  return localTodos.getSubTasks(parentId);
}

export async function createSubTask(
  parentId: string,
  input: { title: string; description?: string; priority?: string; dueDate?: string | null; categoryId?: string | null; tags?: string[] }
): Promise<LocalTodoResponse> {
  return localTodos.create({ ...input, parentId });
}

// --- Reorder ---

export async function reorderTodos(items: { id: string; position: number }[]): Promise<void> {
  await localTodos.reorder(items);
}

// --- Tags ---

export async function fetchTags(): Promise<LocalTagResponse[]> {
  return localTags.getAll();
}

export async function createTag(input: { name: string }): Promise<LocalTagResponse> {
  return localTags.create(input);
}

export async function deleteTag(id: string): Promise<void> {
  return localTags.delete(id);
}
