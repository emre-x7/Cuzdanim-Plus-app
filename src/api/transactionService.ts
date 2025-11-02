// Transaction service
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "../types/api";

export const transactionService = {
  // Tarih aralığına göre işlemler
  async getTransactions(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any[]>> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get<ApiResponse<any[]>>(
      "/transactions",
      { params }
    );
    return response.data;
  },

  // İşlem detayı
  async getTransactionById(id: string): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/transactions/${id}`
    );
    return response.data;
  },

  // İşlem oluştur
  async createTransaction(data: any): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      "/transactions",
      data
    );
    return response.data;
  },

  // İşlem güncelle
  async updateTransaction(id: string, data: any): Promise<ApiResponse<string>> {
    const response = await axiosInstance.put<ApiResponse<string>>(
      `/transactions/${id}`,
      data
    );
    return response.data;
  },

  // İşlem sil
  async deleteTransaction(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/transactions/${id}`
    );
    return response.data;
  },
};
