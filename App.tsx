import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

// React Query client oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Başarısız istek 2 kere tekrar denenir
      staleTime: 1000 * 60 * 5, // 5 dakika
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
