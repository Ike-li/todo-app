import {
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

export function useTodos(page = 1, limit = 20) {
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: ["todos", page, limit],
    queryFn: () => fetchTodos(page, limit),
  });

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
      const previousTodos = queryClient.getQueryData(["todos", page, limit]);

      // Optimistically update
      queryClient.setQueryData(
        ["todos", page, limit],
        (old: { data: TodoResponse[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((todo: TodoResponse) =>
              todo.id === id
                ? { ...todo, completed: !todo.completed }
                : todo
            ),
          };
        }
      );

      return { previousTodos };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(
          ["todos", page, limit],
          context.previousTodos
        );
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
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: ["todos", id],
    queryFn: () => fetchTodo(id),
    enabled: !!id,
  });
}
