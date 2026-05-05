import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  createCategory as createCategoryApi,
  deleteCategory as deleteCategoryApi,
} from "../services/todo.service";
import type { CategoryCreate } from "@todo-app/shared";

export function useCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createCategory = useMutation({
    mutationFn: (input: CategoryCreate) => createCategoryApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    categoriesQuery,
    createCategory,
    deleteCategory,
  };
}
