import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../api/dashboardService";
import { DashboardDto } from "../types/dashboard";

export const useDashboard = () => {
  return useQuery<DashboardDto>({
    queryKey: ["dashboard"], // Cache key
    queryFn: async () => {
      const response = await dashboardService.getDashboard();
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 dakika boyunca cache'den kullan
    refetchOnWindowFocus: true, // Ekrana geri dönünce yenile
  });
};
