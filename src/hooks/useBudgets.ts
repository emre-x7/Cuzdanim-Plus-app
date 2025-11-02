import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetService } from "../api/budgetService";
import {
  BudgetDto,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "../types/budget";

// Tüm bütçeleri getir
export const useBudgets = () => {
  return useQuery<BudgetDto[]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await budgetService.getBudgets();
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Tek bütçe getir
export const useBudget = (id: string) => {
  return useQuery<BudgetDto>({
    queryKey: ["budget", id],
    queryFn: async () => {
      const response = await budgetService.getBudgetById(id);
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!id,
  });
};

// Yeni bütçe oluştur
export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => budgetService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Bütçe güncelle
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetRequest }) =>
      budgetService.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Bütçe sil
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
