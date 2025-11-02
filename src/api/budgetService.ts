import axiosInstance from "./axiosInstance";
import { ApiResponse } from "../types/api";
import {
  BudgetDto,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "../types/budget";

export const budgetService = {
  // Tüm bütçeleri getir
  async getBudgets(): Promise<ApiResponse<BudgetDto[]>> {
    const response = await axiosInstance.get<ApiResponse<BudgetDto[]>>(
      "/budgets"
    );
    return response.data;
  },

  // Bütçe detayı
  async getBudgetById(id: string): Promise<ApiResponse<BudgetDto>> {
    const response = await axiosInstance.get<ApiResponse<BudgetDto>>(
      `/budgets/${id}`
    );
    return response.data;
  },

  // Bütçe oluştur
  async createBudget(data: CreateBudgetRequest): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      "/budgets",
      data
    );
    return response.data;
  },

  // Bütçe güncelle
  async updateBudget(
    id: string,
    data: UpdateBudgetRequest
  ): Promise<ApiResponse<string>> {
    const response = await axiosInstance.put<ApiResponse<string>>(
      `/budgets/${id}`,
      data
    );
    return response.data;
  },

  // Bütçe sil
  async deleteBudget(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/budgets/${id}`
    );
    return response.data;
  },
};
