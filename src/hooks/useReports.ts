import { useQuery } from "@tanstack/react-query";
import { reportService } from "../api/reportService";

export interface ReportDto {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    currency: string;
  };
  categoryReport: Array<{
    categoryId: string;
    categoryName: string;
    categoryIcon?: string;
    categoryColor?: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
  }>;
  monthlyReport: Array<{
    month: string;
    year: number;
    monthName: string;
    income: number;
    expense: number;
    net: number;
  }>;
  incomeExpenseComparison: {
    income: number;
    expense: number;
  };
}

export const useReports = (startDate?: string, endDate?: string) => {
  return useQuery<ReportDto>({
    queryKey: ["reports", startDate, endDate],
    queryFn: async () => {
      const response = await reportService.getReport(startDate, endDate);
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
