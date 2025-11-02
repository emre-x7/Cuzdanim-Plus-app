// LoginResponse, RegisterRequest, vb.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  message: string;
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}
