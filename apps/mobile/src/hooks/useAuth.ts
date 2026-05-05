import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi, register as registerApi } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";
import { setToken as saveToken, removeToken as clearStoredToken } from "../services/api-client";
import type { LoginInput, RegisterInput } from "@todo-app/shared";

export function useAuth() {
  const queryClient = useQueryClient();
  const { setToken, clearToken, isAuthenticated, token } = useAuthStore();

  const login = useMutation({
    mutationFn: (input: LoginInput) => loginApi(input),
    onSuccess: async (data) => {
      await saveToken(data.accessToken);
      setToken(data.accessToken);
    },
  });

  const register = useMutation({
    mutationFn: (input: RegisterInput) => registerApi(input),
    onSuccess: async (data) => {
      await saveToken(data.accessToken);
      setToken(data.accessToken);
    },
  });

  const logout = async () => {
    await clearStoredToken();
    clearToken();
    queryClient.clear();
  };

  return {
    login,
    register,
    logout,
    isAuthenticated,
    token,
  };
}
