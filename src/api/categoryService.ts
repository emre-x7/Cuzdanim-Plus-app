// Category service
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "../types/api";

export const categoryService = {
  async getCategories(): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get<ApiResponse<any[]>>("/categories");
    return response.data;
  },
};
