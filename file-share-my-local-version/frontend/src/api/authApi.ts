import api from "./axios";
import type { AuthResponse, User } from "../types";

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
}

export async function registerUser(data: Registration): Promise<User> {
  const response = await api.post("/auth/register", {
    email: data.email,
    password: data.password,
  });
  return response.data;
}

export async function loginUser(data: Credentials): Promise<AuthResponse> {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get("/auth/me");
  return response.data;
}
