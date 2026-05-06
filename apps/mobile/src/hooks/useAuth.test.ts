import { renderHook, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useAuth } from "./useAuth";
import * as authService from "../services/auth.service";
import * as authStore from "../stores/auth.store";
import { setToken, removeToken } from "../services/api-client";

// Mock dependencies
jest.mock("../services/auth.service");
jest.mock("../services/api-client", () => ({
  setToken: jest.fn(),
  removeToken: jest.fn(),
  getToken: jest.fn(),
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockSetToken = setToken as jest.Mock;
const mockRemoveToken = removeToken as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Zustand store
    authStore.useAuthStore.setState({
      token: null,
      isAuthenticated: false,
    });
  });

  describe("useLogin", () => {
    it("should call login service and set token on success", async () => {
      mockAuthService.login.mockResolvedValueOnce({
        accessToken: "test-token",
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.login.mutateAsync({
          email: "test@example.com",
          password: "password123",
        });
      });

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockSetToken).toHaveBeenCalledWith("test-token");
      expect(authStore.useAuthStore.getState().token).toBe("test-token");
      expect(authStore.useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("should handle login error", async () => {
      mockAuthService.login.mockRejectedValueOnce(
        new Error("Invalid credentials")
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.login.mutateAsync({
            email: "test@example.com",
            password: "wrongpassword",
          });
        } catch {
          // Expected error
        }
      });

      expect(authStore.useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("useRegister", () => {
    it("should call register service and set token on success", async () => {
      mockAuthService.register.mockResolvedValueOnce({
        accessToken: "register-token",
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.register.mutateAsync({
          email: "new@example.com",
          password: "password123",
          name: "Test User",
        });
      });

      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
        name: "Test User",
      });
      expect(mockSetToken).toHaveBeenCalledWith("register-token");
      expect(authStore.useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe("useLogout", () => {
    it("should clear token and reset auth state", async () => {
      // Set initial state
      authStore.useAuthStore.setState({
        token: "existing-token",
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockRemoveToken).toHaveBeenCalled();
      expect(authStore.useAuthStore.getState().token).toBeNull();
      expect(authStore.useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
