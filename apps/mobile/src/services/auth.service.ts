import { localUser, type LocalUser } from "./local-data";

interface AuthResponse {
  accessToken: string;
}

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  const user = await localUser.login(input.email, input.password);
  if (!user) throw new Error("Invalid email or password");
  return { accessToken: user.id };
}

export async function register(input: { email: string; password: string; name?: string }): Promise<AuthResponse> {
  const user = await localUser.register(input.email, input.password, input.name);
  return { accessToken: user.id };
}

export async function getMe(): Promise<LocalUser> {
  const user = await localUser.getMe();
  if (!user) throw new Error("Not authenticated");
  return user;
}
