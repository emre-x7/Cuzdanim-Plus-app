// Login, Register, Refresh Token
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "../types/api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      {
        ...credentials,
        ipAddress: "mobile",
      }
    );
    return response.data;
  },

  // Register
  async register(
    data: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> {
    const response = await axiosInstance.post<ApiResponse<RegisterResponse>>(
      "/auth/register",
      data
    );
    return response.data;
  },

  // Refresh Token
  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      "/auth/refresh-token",
      {
        refreshToken,
        ipAddress: "mobile",
      }
    );
    return response.data;
  },
};
