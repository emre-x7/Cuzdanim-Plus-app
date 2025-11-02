import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "../api/transactionService";
import {
  TransactionDto,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "../types/transaction";

// Tarih aralığına göre işlemleri getir
export const useTransactions = (startDate?: string, endDate?: string) => {
  return useQuery<TransactionDto[]>({
    queryKey: ["transactions", startDate, endDate],
    queryFn: async () => {
      const response = await transactionService.getTransactions(
        startDate,
        endDate
      );
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 dakika (transactions daha sık değişir)
  });
};

// Tek işlem getir
export const useTransaction = (id: string) => {
  return useQuery<TransactionDto>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const response = await transactionService.getTransactionById(id);
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!id,
  });
};

// Yeni işlem oluştur
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) =>
      transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

// İşlem güncelle
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionRequest;
    }) => transactionService.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

// İşlem sil
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};
