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
import { useGoals, useDeleteGoal } from "../hooks/useGoals";
import { colors } from "../constants/colors";
import GoalCard from "../components/goal/GoalCard";
import GoalFormModal from "../components/goal/GoalFormModal";
import ContributionModal from "../components/goal/ContributionModal";
import { GoalDto } from "../types/goal";

export default function GoalsScreen() {
  const { data: goals, isLoading, isError, error, refetch } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  const [refreshing, setRefreshing] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [contributionModalVisible, setContributionModalVisible] =
    useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalDto | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleGoalPress = (goal: GoalDto) => {
    const statusText =
      goal.status === "Completed"
        ? "✅ Tamamlandı"
        : goal.status === "Paused"
        ? "⏸️ Duraklatıldı"
        : goal.status === "Cancelled"
        ? "❌ İptal Edildi"
        : "🎯 Aktif";

    Alert.alert(
      goal.name,
      `${statusText}\n\nİlerleme: %${goal.progressPercentage.toFixed(
        0
      )}\nBiriken: ${goal.currentAmount.toFixed(
        2
      )} ₺\nHedef: ${goal.targetAmount.toFixed(2)} ₺\n\nNe yapmak istersiniz?`,
      [
        { text: "İptal", style: "cancel" },
        ...(goal.status === "Active"
          ? [
              {
                text: "Katkı Ekle",
                onPress: () => {
                  setSelectedGoal(goal);
                  setContributionModalVisible(true);
                },
              },
            ]
          : []),
        {
          text: "Düzenle",
          onPress: () => {
            setSelectedGoal(goal);
            setFormModalVisible(true);
          },
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => handleDeleteGoal(goal),
        },
      ]
    );
  };

  const handleDeleteGoal = (goal: GoalDto) => {
    Alert.alert(
      "Hedef Sil",
      `"${goal.name}" hedefini silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoalMutation.mutateAsync(goal.id);
              Alert.alert("Başarılı", "Hedef silindi");
            } catch (error: any) {
              Alert.alert("Hata", error.message || "Hedef silinemedi");
            }
          },
        },
      ]
    );
  };

  const handleAddGoal = () => {
    setSelectedGoal(null);
    setFormModalVisible(true);
  };

  const handleCloseFormModal = () => {
    setFormModalVisible(false);
    setSelectedGoal(null);
  };

  const handleCloseContributionModal = () => {
    setContributionModalVisible(false);
    setSelectedGoal(null);
  };

  const handleContribute = (goal: GoalDto) => {
    setSelectedGoal(goal);
    setContributionModalVisible(true);
  };

  // Loading
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Hedefler yükleniyor...</Text>
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
          {error?.message || "Hedefler yüklenemedi"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty
  if (!goals || goals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Hedefler</Text>
          <TouchableOpacity
            style={styles.addIconButton}
            onPress={handleAddGoal}
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
            name="target"
            size={80}
            color={colors.border}
          />
          <Text style={styles.emptyTitle}>Henüz hedef yok</Text>
          <Text style={styles.emptySubtitle}>
            Finansal hedeflerinizi belirleyin ve düzenli katkılarla
            hayallerinize ulaşın
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Hedef Oluştur</Text>
          </TouchableOpacity>
        </View>

        <GoalFormModal
          visible={formModalVisible}
          onClose={handleCloseFormModal}
          goal={selectedGoal}
        />
      </View>
    );
  }

  // Hedefleri duruma göre sırala (Active → Completed → Paused → Cancelled)
  const sortedGoals = [...goals].sort((a, b) => {
    const statusOrder = { Active: 0, Completed: 1, Paused: 2, Cancelled: 3 };
    const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 999;
    const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return b.progressPercentage - a.progressPercentage;
  });

  // Özet istatistikler
  const activeGoals = goals.filter((g) => g.status === "Active");
  const completedGoals = goals.filter((g) => g.status === "Completed");
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Success - List
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hedefler</Text>
        <TouchableOpacity style={styles.addIconButton} onPress={handleAddGoal}>
          <MaterialCommunityIcons
            name="plus-circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Özet Kartı */}
      {activeGoals.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Genel Durum</Text>
            <Text style={[styles.summaryPercentage, { color: colors.primary }]}>
              %{overallProgress.toFixed(0)}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(overallProgress, 100)}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Aktif Hedef</Text>
              <Text style={styles.statValue}>{activeGoals.length}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tamamlanan</Text>
              <Text style={styles.statValue}>{completedGoals.length}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Toplam Birikim</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {totalSaved.toLocaleString("tr-TR", {
                  minimumFractionDigits: 0,
                })}{" "}
                ₺
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Hedef Listesi */}
      <FlatList
        data={sortedGoals}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            onPress={() => handleGoalPress(item)}
            onContribute={() => handleContribute(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <GoalFormModal
        visible={formModalVisible}
        onClose={handleCloseFormModal}
        goal={selectedGoal}
      />

      <ContributionModal
        visible={contributionModalVisible}
        onClose={handleCloseContributionModal}
        goal={selectedGoal}
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
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  summaryPercentage: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  summaryStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
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
