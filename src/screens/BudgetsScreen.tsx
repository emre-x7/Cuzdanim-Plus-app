import React, { useState } from "react";
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
import { useBudgets, useDeleteBudget } from "../hooks/useBudgets";
import { colors } from "../constants/colors";
import BudgetCard from "../components/budget/BudgetCard";
import BudgetFormModal from "../components/budget/BudgetFormModal";
import { BudgetDto } from "../types/budget";

export default function BudgetsScreen() {
  const { data: budgets, isLoading, isError, error, refetch } = useBudgets();
  const deleteBudgetMutation = useDeleteBudget();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetDto | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleBudgetPress = (budget: BudgetDto) => {
    const statusText =
      budget.percentageUsed >= 100
        ? "🔴 Bütçe aşıldı!"
        : budget.percentageUsed >= 80
        ? "🟡 Uyarı: %80 üstü"
        : "🟢 Normal";

    Alert.alert(
      budget.name,
      `${
        budget.categoryName
      }\n${statusText}\n\nHarcanan: ${budget.spent.toFixed(
        2
      )} ₺\nBütçe: ${budget.amount.toFixed(2)} ₺\n\nNe yapmak istersiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Düzenle",
          onPress: () => {
            setSelectedBudget(budget);
            setModalVisible(true);
          },
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => handleDeleteBudget(budget),
        },
      ]
    );
  };

  const handleDeleteBudget = (budget: BudgetDto) => {
    Alert.alert(
      "Bütçe Sil",
      `"${budget.name}" bütçesini silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBudgetMutation.mutateAsync(budget.id);
              Alert.alert("Başarılı", "Bütçe silindi");
            } catch (error: any) {
              Alert.alert("Hata", error.message || "Bütçe silinemedi");
            }
          },
        },
      ]
    );
  };

  const handleAddBudget = () => {
    setSelectedBudget(null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedBudget(null);
  };

  // Loading
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Bütçeler yükleniyor...</Text>
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
          {error?.message || "Bütçeler yüklenemedi"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty
  if (!budgets || budgets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bütçeler</Text>
          <TouchableOpacity
            style={styles.addIconButton}
            onPress={handleAddBudget}
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
            name="chart-donut"
            size={80}
            color={colors.border}
          />
          <Text style={styles.emptyTitle}>Henüz bütçe yok</Text>
          <Text style={styles.emptySubtitle}>
            Kategorileriniz için aylık bütçe belirleyerek harcamalarınızı
            kontrol altında tutun
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddBudget}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Bütçe Oluştur</Text>
          </TouchableOpacity>
        </View>

        <BudgetFormModal
          visible={modalVisible}
          onClose={handleCloseModal}
          budget={selectedBudget}
        />
      </View>
    );
  }

  // Bütçeleri duruma göre sırala (Exceeded → Warning → Normal)
  const sortedBudgets = [...budgets].sort((a, b) => {
    if (a.percentageUsed >= 100 && b.percentageUsed < 100) return -1;
    if (a.percentageUsed < 100 && b.percentageUsed >= 100) return 1;
    if (a.percentageUsed >= 80 && b.percentageUsed < 80) return -1;
    if (a.percentageUsed < 80 && b.percentageUsed >= 80) return 1;
    return b.percentageUsed - a.percentageUsed;
  });

  // Özet istatistikler
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const alertCount = budgets.filter((b) => b.percentageUsed >= 80).length;

  // Success - List
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bütçeler</Text>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={handleAddBudget}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Özet Kartı */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Toplam Bütçe</Text>
            <Text style={styles.summaryValue}>
              {totalBudget.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              ₺
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Toplam Harcama</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>
              {totalSpent.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}{" "}
              ₺
            </Text>
          </View>
        </View>

        {alertCount > 0 && (
          <View style={styles.alertBanner}>
            <MaterialCommunityIcons
              name="alert"
              size={20}
              color={colors.warning}
            />
            <Text style={styles.alertText}>
              {alertCount} bütçe uyarı seviyesinde veya aşıldı
            </Text>
          </View>
        )}
      </View>

      {/* Bütçe Listesi */}
      <FlatList
        data={sortedBudgets}
        renderItem={({ item }) => (
          <BudgetCard budget={item} onPress={() => handleBudgetPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <BudgetFormModal
        visible={modalVisible}
        onClose={handleCloseModal}
        budget={selectedBudget}
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
  summaryCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.warning}15`,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning,
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
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
    lineHeight: 24,
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
