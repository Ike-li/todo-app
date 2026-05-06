import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchTodos,
  fetchTodo,
  createTodo as createTodoApi,
  toggleTodo as toggleTodoApi,
  deleteTodo as deleteTodoApi,
  updateTodo as updateTodoApi,
  reorderTodos as reorderTodosApi,
  fetchSubTasks,
  createSubTask,
} from "../services/todo.service";
import type { TodoCreate, TodoUpdate, TodoResponse } from "@todo-app/shared";

export function useTodos(limit = 20) {
  const queryClient = useQueryClient();

  const todosQuery = useInfiniteQuery({
    queryKey: ["todos"],
    queryFn: ({ pageParam = 1 }) => fetchTodos(pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return allPages.length < totalPages ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten all pages into a single array
  const todos = todosQuery.data?.pages.flatMap(page => page.data) || [];
  const total = todosQuery.data?.pages[0]?.total || 0;

  const createTodo = useMutation({
    mutationFn: (input: TodoCreate) => createTodoApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const toggleTodo = useMutation({
    mutationFn: (id: string) => toggleTodoApi(id),
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["todos"]);

      // Optimistically update across all pages
      queryClient.setQueryData(
        ["todos"],
        (old: { pages: { data: TodoResponse[] }[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data.map((todo: TodoResponse) =>
                todo.id === id
                  ? { ...todo, completed: !todo.completed }
                  : todo
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["todos"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteTodo = useMutation({
    mutationFn: (id: string) => deleteTodoApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const updateTodo = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TodoUpdate }) =>
      updateTodoApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const reorderTodos = useMutation({
    mutationFn: (items: { id: string; position: number }[]) =>
      reorderTodosApi(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return {
    todosQuery,
    todos,
    total,
    createTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    reorderTodos,
  };
}

export function useSubTasks(parentId: string | undefined) {
  const queryClient = useQueryClient();

  const subTasksQuery = useQuery({
    queryKey: ["todos", "subtasks", parentId],
    queryFn: () => fetchSubTasks(parentId!),
    enabled: !!parentId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const addSubTask = useMutation({
    mutationFn: (input: Omit<TodoCreate, "parentId">) =>
      createSubTask(parentId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todos", "subtasks", parentId] });
    },
  });

  return { subTasksQuery, addSubTask };
}

export function useAllTodos() {
  return useQuery({
    queryKey: ["todos", "all"],
    queryFn: async () => {
      const result = await fetchTodos(1, 100);
      return result.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: ["todos", id],
    queryFn: () => fetchTodo(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
