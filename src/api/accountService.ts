// Account CRUD
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "../types/api";
import {
  AccountDto,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "../types/account";

export const accountService = {
  // Tüm hesapları getir
  async getAccounts(): Promise<ApiResponse<AccountDto[]>> {
    const response = await axiosInstance.get<ApiResponse<AccountDto[]>>(
      "/accounts"
    );
    return response.data;
  },

  // Hesap oluştur
  async createAccount(
    data: CreateAccountRequest
  ): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      "/accounts",
      data
    );
    return response.data;
  },

  // Hesap güncelle
  async updateAccount(
    id: string,
    data: UpdateAccountRequest
  ): Promise<ApiResponse<string>> {
    const response = await axiosInstance.put<ApiResponse<string>>(
      `/accounts/${id}`,
      data
    );
    return response.data;
  },

  // Hesap sil
  async deleteAccount(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/accounts/${id}`
    );
    return response.data;
  },
};
