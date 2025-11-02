import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../api/categoryService";

export interface CategoryDto {
  id: string;
  name: string;
  transactionType: string; // "Income" veya "Expense"
  type: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

export const useCategories = () => {
  return useQuery<CategoryDto[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await categoryService.getCategories();
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 dakika (kategoriler nadiren değişir)
  });
};
