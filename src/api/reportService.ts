import axiosInstance from "./axiosInstance";
import { ApiResponse } from "../types/api";
import { ReportDto } from "../hooks/useReports";

export const reportService = {
  async getReport(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<ReportDto>> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get<ApiResponse<ReportDto>>(
      "/reports",
      { params }
    );
    return response.data;
  },
};
