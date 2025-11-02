import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalService } from "../api/goalService";
import {
  GoalDto,
  CreateGoalRequest,
  UpdateGoalRequest,
  AddContributionRequest,
} from "../types/goal";

// Tüm hedefleri getir
export const useGoals = () => {
  return useQuery<GoalDto[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await goalService.getGoals();
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Tek hedef getir
export const useGoal = (id: string) => {
  return useQuery<GoalDto>({
    queryKey: ["goal", id],
    queryFn: async () => {
      const response = await goalService.getGoalById(id);
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!id,
  });
};

// Yeni hedef oluştur
export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalRequest) => goalService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Hedef güncelle
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) =>
      goalService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Hedefe katkı ekle
export const useAddContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddContributionRequest }) =>
      goalService.addContribution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Hedef sil
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
