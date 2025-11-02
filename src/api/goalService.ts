import axiosInstance from "./axiosInstance";
import { ApiResponse } from "../types/api";
import {
  GoalDto,
  CreateGoalRequest,
  UpdateGoalRequest,
  AddContributionRequest,
} from "../types/goal";

export const goalService = {
  // Tüm hedefleri getir
  async getGoals(): Promise<ApiResponse<GoalDto[]>> {
    const response = await axiosInstance.get<ApiResponse<GoalDto[]>>("/goals");
    return response.data;
  },

  // Hedef detayı
  async getGoalById(id: string): Promise<ApiResponse<GoalDto>> {
    const response = await axiosInstance.get<ApiResponse<GoalDto>>(
      `/goals/${id}`
    );
    return response.data;
  },

  // Hedef oluştur
  async createGoal(data: CreateGoalRequest): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      "/goals",
      data
    );
    return response.data;
  },

  // Hedef güncelle
  async updateGoal(
    id: string,
    data: UpdateGoalRequest
  ): Promise<ApiResponse<string>> {
    const response = await axiosInstance.put<ApiResponse<string>>(
      `/goals/${id}`,
      data
    );
    return response.data;
  },

  // Hedefe katkı ekle
  async addContribution(
    id: string,
    data: AddContributionRequest
  ): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      `/goals/${id}/contribute`,
      data
    );
    return response.data;
  },

  // Hedef sil
  async deleteGoal(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/goals/${id}`
    );
    return response.data;
  },
};
