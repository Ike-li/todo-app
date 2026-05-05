import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTags,
  createTag as createTagApi,
  deleteTag as deleteTagApi,
} from "../services/todo.service";
import type { TagCreate } from "@todo-app/shared";

export function useTags() {
  const queryClient = useQueryClient();

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const createTag = useMutation({
    mutationFn: (input: TagCreate) => createTagApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const deleteTag = useMutation({
    mutationFn: (id: string) => deleteTagApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  return {
    tagsQuery,
    createTag,
    deleteTag,
  };
}
