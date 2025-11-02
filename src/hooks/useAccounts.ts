import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService } from "../api/accountService";
import {
  AccountDto,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "../types/account";

// Tüm hesapları getir
export const useAccounts = () => {
  return useQuery<AccountDto[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await accountService.getAccounts();
      if (!response.isSuccess) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};

// Yeni hesap oluştur
export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountRequest) =>
      accountService.createAccount(data),
    onSuccess: () => {
      // Başarılı olunca accounts listesini yenile
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }); // Dashboard'u da yenile
    },
  });
};

// Hesap güncelle
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) =>
      accountService.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// Hesap sil
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
