import { apiClient } from "./api-client";
import type { LoginInput, RegisterInput } from "@todo-app/shared";

interface AuthResponse {
  accessToken: string;
}

interface UserResponse {
  id: string;
  email: string;
  name: string | null;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", input);
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/register", input);
}

export async function getMe(): Promise<UserResponse> {
  return apiClient.get<UserResponse>("/auth/me");
}
