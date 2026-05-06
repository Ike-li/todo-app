import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage Keys ──────────────────────────────────────────────

const KEYS = {
  TODOS: '@todoapp/todos',
  CATEGORIES: '@todoapp/categories',
  TAGS: '@todoapp/tags',
  TAGS_ON_TODOS: '@todoapp/tagsontodos',
  USER: '@todoapp/user',
} as const;

// ─── Internal Data Shapes ──────────────────────────────────────

interface StoredUser {
  id: string;
  email: string;
  name: string | null;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredTodo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
  position: number;
  categoryId: string | null;
  parentId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredCategory {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  userId: string;
  createdAt: string;
}

interface StoredTag {
  id: string;
  name: string;
}

interface StoredTagsOnTodo {
  todoId: string;
  tagId: string;
}

// ─── Public Response Shapes ────────────────────────────────────

export interface LocalUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalTodoResponse {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
  position: number;
  categoryId: string | null;
  parentId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; color: string | null; icon: string | null } | null;
  tags: { tag: { id: string; name: string } }[];
  _count: { subTasks: number };
}

export interface PaginatedTodos {
  data: LocalTodoResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface LocalCategoryResponse {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  userId: string;
  createdAt: string;
}

export interface LocalTagResponse {
  id: string;
  name: string;
}

export interface GetAllTodosParams {
  page?: number;
  limit?: number;
  completed?: boolean;
  search?: string;
  categoryId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ─── Helpers ───────────────────────────────────────────────────

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

async function getStorage<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

async function setStorage<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

function stripPassword(user: StoredUser): LocalUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function buildTodoResponse(
  todo: StoredTodo,
  allCategories: StoredCategory[],
  allTags: StoredTag[],
  allTagsOnTodos: StoredTagsOnTodo[],
  allTodos: StoredTodo[],
): LocalTodoResponse {
  const category = todo.categoryId
    ? allCategories.find((c) => c.id === todo.categoryId) ?? null
    : null;

  const tagsForTodo = allTagsOnTodos
    .filter((tot) => tot.todoId === todo.id)
    .map((tot) => {
      const tag = allTags.find((t) => t.id === tot.tagId);
      return tag ? { tag: { id: tag.id, name: tag.name } } : null;
    })
    .filter((t): t is { tag: { id: string; name: string } } => t !== null);

  const subTaskCount = allTodos.filter((t) => t.parentId === todo.id).length;

  return {
    ...todo,
    category: category
      ? { id: category.id, name: category.name, color: category.color, icon: category.icon }
      : null,
    tags: tagsForTodo,
    _count: { subTasks: subTaskCount },
  };
}

// ─── User Module ───────────────────────────────────────────────

export const localUser = {
  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<LocalUser> {
    const users = await getStorage<StoredUser>(KEYS.USER);

    if (users.length > 0 && users[0].email === email) {
      throw new Error('User with this email already exists');
    }

    const user: StoredUser = {
      id: generateId(),
      email,
      name: name ?? null,
      password,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    // Store as single-user (array with one element)
    await setStorage(KEYS.USER, [user]);
    return stripPassword(user);
  },

  async login(email: string, password: string): Promise<LocalUser | null> {
    const users = await getStorage<StoredUser>(KEYS.USER);
    const user = users.find((u) => u.email === email && u.password === password);
    return user ? stripPassword(user) : null;
  },

  async getMe(): Promise<LocalUser | null> {
    const users = await getStorage<StoredUser>(KEYS.USER);
    return users.length > 0 ? stripPassword(users[0]) : null;
  },

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },
};

// ─── Todos Module ──────────────────────────────────────────────

export const localTodos = {
  async getAll(params?: GetAllTodosParams): Promise<PaginatedTodos> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    let todos = await getStorage<StoredTodo>(KEYS.TODOS);
    const categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    const tags = await getStorage<StoredTag>(KEYS.TAGS);
    const tagsOnTodos = await getStorage<StoredTagsOnTodo>(KEYS.TAGS_ON_TODOS);

    // Filter by completed
    if (params?.completed !== undefined) {
      todos = todos.filter((t) => t.completed === params.completed);
    }

    // Filter by search (title or description)
    if (params?.search) {
      const q = params.search.toLowerCase();
      todos = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)),
      );
    }

    // Filter by category
    if (params?.categoryId) {
      todos = todos.filter((t) => t.categoryId === params.categoryId);
    }

    // Sort
    const sortField = params?.sort ?? 'position';
    const sortOrder = params?.order ?? 'asc';
    todos.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField];
      const bVal = (b as unknown as Record<string, unknown>)[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    const total = todos.length;
    const start = (page - 1) * limit;
    const paged = todos.slice(start, start + limit);

    return {
      data: paged.map((t) => buildTodoResponse(t, categories, tags, tagsOnTodos, todos)),
      total,
      page,
      limit,
    };
  },

  async getById(id: string): Promise<LocalTodoResponse> {
    const todos = await getStorage<StoredTodo>(KEYS.TODOS);
    const categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    const tags = await getStorage<StoredTag>(KEYS.TAGS);
    const tagsOnTodos = await getStorage<StoredTagsOnTodo>(KEYS.TAGS_ON_TODOS);

    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      throw new Error(`Todo not found: ${id}`);
    }

    return buildTodoResponse(todo, categories, tags, tagsOnTodos, todos);
  },

  async getSubTasks(parentId: string): Promise<LocalTodoResponse[]> {
    const todos = await getStorage<StoredTodo>(KEYS.TODOS);
    const categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    const tags = await getStorage<StoredTag>(KEYS.TAGS);
    const tagsOnTodos = await getStorage<StoredTagsOnTodo>(KEYS.TAGS_ON_TODOS);

    const subTasks = todos
      .filter((t) => t.parentId === parentId)
      .sort((a, b) => a.position - b.position);

    return subTasks.map((t) => buildTodoResponse(t, categories, tags, tagsOnTodos, todos));
  },

  async create(data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    categoryId?: string | null;
    parentId?: string | null;
    tags?: string[];
  }): Promise<LocalTodoResponse> {
    const todos = await getStorage<StoredTodo>(KEYS.TODOS);
    const categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    const tags = await getStorage<StoredTag>(KEYS.TAGS);
    let tagsOnTodos = await getStorage<StoredTagsOnTodo>(KEYS.TAGS_ON_TODOS);

    const maxPosition = todos.reduce((max, t) => Math.max(max, t.position), 0);

    const todo: StoredTodo = {
      id: generateId(),
      title: data.title,
      description: data.description ?? null,
      completed: false,
      priority: (data.priority as StoredTodo['priority']) ?? 'NONE',
      dueDate: data.dueDate ?? null,
      position: maxPosition + 1,
      categoryId: data.categoryId ?? null,
      parentId: data.parentId ?? null,
      userId: (await localUser.getMe())?.id ?? '',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    // Resolve tags
    let updatedTags = [...tags];
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const normalized = tagName.trim().toLowerCase();
        if (!normalized) continue;

        let existing = updatedTags.find((t) => t.name === normalized);
        if (!existing) {
          const newTag: StoredTag = { id: generateId(), name: normalized };
          updatedTags = [...updatedTags, newTag];
          existing = newTag;
        }
        tagsOnTodos = [...tagsOnTodos, { todoId: todo.id, tagId: existing.id }];
      }
      await setStorage(KEYS.TAGS, updatedTags);
      await setStorage(KEYS.TAGS_ON_TODOS, tagsOnTodos);
    }

    todos.push(todo);
    await setStorage(KEYS.TODOS, todos);

    return buildTodoResponse(todo, categories, updatedTags, tagsOnTodos, todos);
  },

  async update(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      completed?: boolean;
      priority?: string;
      dueDate?: string | null;
      categoryId?: string | null;
      parentId?: string | null;
      tags?: string[];
    },
  ): Promise<LocalTodoResponse> {
    const todos = await getStorage<StoredTodo>(KEYS.TODOS);
    const categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    let tags = await getStorage<StoredTag>(KEYS.TAGS);
    let tagsOnTodos = await getStorage<StoredTagsOnTodo>(KEYS.TAGS_ON_TODOS);

    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Todo not found: ${id}`);
    }

    // Update basic fields
    const todo = todos[index];
    if (data.title !== undefined) todo.title = data.title;
    if (data.description !== undefined) todo.description = data.description;
    if (data.completed !== undefined) todo.completed = data.completed;
    if (data.priority !== undefined) todo.priority = data.priority as StoredTodo['priority'];
    if (data.dueDate !== undefined) todo.dueDate = data.dueDate;
    if (data.categoryId !== undefined) todo.categoryId = data.categoryId;
    if (data.parentId !== undefined) todo.parentId = data.parentId;
    todo.updatedAt = nowIso();

    todos[index] = todo;

    // Handle tags replacement
    if (data.tags !== undefined) {
      // Remove existing tag relations for this todo
      tagsOnTodos = tagsOnTodos.filter((tot) => tot.todoId !== id);

      // Add new tag relations
      for (const tagName of data.tags) {
        const normalized = tagName.trim().toLowerCase();
        if (!normalized) continue;

        let existing = tags.find((t) => t.name === normalized);
        if (!existing) {
          const newTag: StoredTag = { id: generateId(), name: normalized };
          tags = [...tags, newTag];
          existing = newTag;
        }
        tagsOnTodos = [...tagsOnTodos, { todoId: id, tagId: existing.id }];
      }

      await setStorage(KEYS.TAGS, tags);
      await setStorage(KEYS.TAGS_ON_TODOS, tagsOnTodos);
    }

    await setStorage(KEYS.TODOS, todos);

    return buildTodoResponse(todo, categories, tags, tagsOnTodos, todos);
  },

  async toggle(id: string): Promise<LocalTodoResponse> {
    const todos = await getStorage<StoredTodo>(KEYS.TODOS);
    const categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    const tags = await getStorage<StoredTag>(KEYS.TAGS);
    const tagsOnTodos = await getStorage<StoredTagsOnTodo>(KEYS.TAGS_ON_TODOS);

    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Todo not found: ${id}`);
    }

    todos[index].completed = !todos[index].completed;
    todos[index].updatedAt = nowIso();

    await setStorage(KEYS.TODOS, todos);

    return buildTodoResponse(todos[index], categories, tags, tagsOnTodos, todos);
  },

  async reorder(
    items: { id: string; position: number }[],
  ): Promise<LocalTodoResponse[]> {
    const todos = await getStorage<StoredTodo>(KEYS.TODOS);
    const categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    const tags = await getStorage<StoredTag>(KEYS.TAGS);
    const tagsOnTodos = await getStorage<StoredTagsOnTodo>(KEYS.TAGS_ON_TODOS);

    const positionMap = new Map(items.map((item) => [item.id, item.position]));

    for (const todo of todos) {
      const newPos = positionMap.get(todo.id);
      if (newPos !== undefined) {
        todo.position = newPos;
        todo.updatedAt = nowIso();
      }
    }

    await setStorage(KEYS.TODOS, todos);

    return items
      .map((item) => {
        const todo = todos.find((t) => t.id === item.id);
        return todo ? buildTodoResponse(todo, categories, tags, tagsOnTodos, todos) : null;
      })
      .filter((t): t is LocalTodoResponse => t !== null);
  },

  async delete(id: string): Promise<void> {
    let todos = await getStorage<StoredTodo>(KEYS.TODOS);
    let tagsOnTodos = await getStorage<StoredTagsOnTodo>(KEYS.TAGS_ON_TODOS);

    // Remove the todo and its sub-tasks (cascade)
    const idsToRemove = new Set<string>();
    idsToRemove.add(id);

    // Find all sub-tasks recursively
    let changed = true;
    while (changed) {
      changed = false;
      for (const t of todos) {
        if (t.parentId && idsToRemove.has(t.parentId) && !idsToRemove.has(t.id)) {
          idsToRemove.add(t.id);
          changed = true;
        }
      }
    }

    todos = todos.filter((t) => !idsToRemove.has(t.id));
    tagsOnTodos = tagsOnTodos.filter((tot) => !idsToRemove.has(tot.todoId));

    await setStorage(KEYS.TODOS, todos);
    await setStorage(KEYS.TAGS_ON_TODOS, tagsOnTodos);
  },
};

// ─── Categories Module ─────────────────────────────────────────

export const localCategories = {
  async getAll(): Promise<LocalCategoryResponse[]> {
    return getStorage<StoredCategory>(KEYS.CATEGORIES);
  },

  async create(data: {
    name: string;
    color?: string | null;
    icon?: string | null;
  }): Promise<LocalCategoryResponse> {
    const categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    const user = await localUser.getMe();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check uniqueness per user
    if (categories.some((c) => c.userId === user.id && c.name === data.name)) {
      throw new Error('Category with this name already exists');
    }

    const category: StoredCategory = {
      id: generateId(),
      name: data.name,
      color: data.color ?? null,
      icon: data.icon ?? null,
      userId: user.id,
      createdAt: nowIso(),
    };

    categories.push(category);
    await setStorage(KEYS.CATEGORIES, categories);
    return category;
  },

  async update(
    id: string,
    data: { name?: string; color?: string | null; icon?: string | null },
  ): Promise<LocalCategoryResponse> {
    const categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error(`Category not found: ${id}`);
    }

    if (data.name !== undefined) categories[index].name = data.name;
    if (data.color !== undefined) categories[index].color = data.color;
    if (data.icon !== undefined) categories[index].icon = data.icon;

    await setStorage(KEYS.CATEGORIES, categories);
    return categories[index];
  },

  async delete(id: string): Promise<void> {
    let categories = await getStorage<StoredCategory>(KEYS.CATEGORIES);
    categories = categories.filter((c) => c.id !== id);
    await setStorage(KEYS.CATEGORIES, categories);

    // Set categoryId to null on affected todos
    const todos = await getStorage<StoredTodo>(KEYS.TODOS);
    for (const todo of todos) {
      if (todo.categoryId === id) {
        todo.categoryId = null;
      }
    }
    await setStorage(KEYS.TODOS, todos);
  },
};

// ─── Tags Module ───────────────────────────────────────────────

export const localTags = {
  async getAll(): Promise<LocalTagResponse[]> {
    return getStorage<StoredTag>(KEYS.TAGS);
  },

  async getById(id: string): Promise<LocalTagResponse> {
    const tags = await getStorage<StoredTag>(KEYS.TAGS);
    const tag = tags.find((t) => t.id === id);
    if (!tag) {
      throw new Error(`Tag not found: ${id}`);
    }
    return tag;
  },

  async create(data: { name: string }): Promise<LocalTagResponse> {
    const tags = await getStorage<StoredTag>(KEYS.TAGS);
    const normalized = data.name.trim().toLowerCase();

    if (!normalized) {
      throw new Error('Tag name is required');
    }

    if (tags.some((t) => t.name === normalized)) {
      throw new Error('Tag with this name already exists');
    }

    const tag: StoredTag = {
      id: generateId(),
      name: normalized,
    };

    tags.push(tag);
    await setStorage(KEYS.TAGS, tags);
    return tag;
  },

  async delete(id: string): Promise<void> {
    let tags = await getStorage<StoredTag>(KEYS.TAGS);
    tags = tags.filter((t) => t.id !== id);
    await setStorage(KEYS.TAGS, tags);

    // Remove associated TagsOnTodos entries
    let tagsOnTodos = await getStorage<StoredTagsOnTodo>(KEYS.TAGS_ON_TODOS);
    tagsOnTodos = tagsOnTodos.filter((tot) => tot.tagId !== id);
    await setStorage(KEYS.TAGS_ON_TODOS, tagsOnTodos);
  },
};
