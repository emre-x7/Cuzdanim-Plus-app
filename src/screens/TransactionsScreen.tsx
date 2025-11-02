import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useTransactions,
  useDeleteTransaction,
} from "../hooks/useTransactions";
import { colors } from "../constants/colors";
import TransactionCard from "../components/transaction/TransactionCard";
import TransactionFormModal from "../components/transaction/TransactionFormModal";
import { TransactionDto } from "../types/transaction";

export default function TransactionsScreen() {
  // Bu ay başlangıç ve bitiş tarihleri
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate] = useState(firstDayOfMonth.toISOString());
  const [endDate] = useState(lastDayOfMonth.toISOString());

  const {
    data: transactions,
    isLoading,
    isError,
    error,
    refetch,
  } = useTransactions(startDate, endDate);
  const deleteTransactionMutation = useDeleteTransaction();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDto | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleTransactionPress = (transaction: TransactionDto) => {
    Alert.alert(
      transaction.categoryName,
      `${transaction.type === "Income" ? "Gelir" : "Gider"}: ${
        transaction.amount
      } ${transaction.currency}\n${
        transaction.description || ""
      }\n\nNe yapmak istersiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Düzenle",
          onPress: () => {
            setSelectedTransaction(transaction);
            setModalVisible(true);
          },
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => handleDeleteTransaction(transaction),
        },
      ]
    );
  };

  const handleDeleteTransaction = (transaction: TransactionDto) => {
    Alert.alert(
      "İşlem Sil",
      `Bu işlemi silmek istediğinizden emin misiniz?\n\n${transaction.categoryName}\n${transaction.amount} ${transaction.currency}`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransactionMutation.mutateAsync(transaction.id);
              Alert.alert("Başarılı", "İşlem silindi");
            } catch (error: any) {
              Alert.alert("Hata", error.message || "İşlem silinemedi");
            }
          },
        },
      ]
    );
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  // Gelir ve Gider toplamları
  const totals = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0 };

    const income = transactions
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense };
  }, [transactions]);

  // Loading
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>İşlemler yükleniyor...</Text>
      </View>
    );
  }

  // Error
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={64}
          color={colors.error}
        />
        <Text style={styles.errorText}>
          {error?.message || "İşlemler yüklenemedi"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty
  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>İşlemler</Text>
          <TouchableOpacity
            style={styles.addIconButton}
            onPress={handleAddTransaction}
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={32}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="receipt-text-outline"
            size={80}
            color={colors.border}
          />
          <Text style={styles.emptyTitle}>Henüz işlem yok</Text>
          <Text style={styles.emptySubtitle}>
            İlk gelir veya giderinizi ekleyerek başlayın
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTransaction}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={styles.addButtonText}>İşlem Ekle</Text>
          </TouchableOpacity>
        </View>

        <TransactionFormModal
          visible={modalVisible}
          onClose={handleCloseModal}
          transaction={selectedTransaction}
        />
      </View>
    );
  }

  // Success - List
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>İşlemler</Text>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={handleAddTransaction}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Özet Kartları */}
      <View style={styles.summaryContainer}>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: `${colors.income}15` },
          ]}
        >
          <MaterialCommunityIcons
            name="arrow-down"
            size={24}
            color={colors.income}
          />
          <Text style={styles.summaryLabel}>Gelir</Text>
          <Text style={[styles.summaryAmount, { color: colors.income }]}>
            {totals.income.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })}{" "}
            ₺
          </Text>
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: `${colors.expense}15` },
          ]}
        >
          <MaterialCommunityIcons
            name="arrow-up"
            size={24}
            color={colors.expense}
          />
          <Text style={styles.summaryLabel}>Gider</Text>
          <Text style={[styles.summaryAmount, { color: colors.expense }]}>
            {totals.expense.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })}{" "}
            ₺
          </Text>
        </View>
      </View>

      {/* İşlem Listesi */}
      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={() => handleTransactionPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TransactionFormModal
        visible={modalVisible}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  addIconButton: {
    padding: 4,
  },
  summaryContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listContent: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
