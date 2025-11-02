// Dashboard service
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "../types/api";

export const dashboardService = {
  async getDashboard(): Promise<ApiResponse<any>> {
    const response = await axiosInstance.get<ApiResponse<any>>("/dashboard");
    return response.data;
  },
};
