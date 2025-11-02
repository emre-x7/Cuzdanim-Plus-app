import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BudgetDto } from "../../types/budget";
import { colors } from "../../constants/colors";
import { formatCurrency } from "../../utils/formatCurrency";
import { Currency } from "../../constants/enums";

interface BudgetCardProps {
  budget: BudgetDto;
  onPress?: () => void;
}

export default function BudgetCard({ budget, onPress }: BudgetCardProps) {
  // Status'e göre renk
  const getStatusColor = () => {
    if (budget.percentageUsed >= 100) return colors.error;
    if (budget.percentageUsed >= 80) return colors.warning;
    return colors.success;
  };

  const statusColor = getStatusColor();
  const progressWidth = Math.min(budget.percentageUsed, 100);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${colors.primary}15` },
            ]}
          >
            <MaterialCommunityIcons
              name={(budget.categoryIcon as any) || "tag"}
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.categoryName}>{budget.categoryName}</Text>
            <Text style={styles.budgetName}>{budget.name}</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressWidth}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
        <Text style={[styles.percentage, { color: statusColor }]}>
          %{budget.percentageUsed.toFixed(0)}
        </Text>
      </View>

      {/* Amounts */}
      <View style={styles.amountsContainer}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Harcanan</Text>
          <Text style={[styles.amountValue, { color: statusColor }]}>
            {formatCurrency(budget.spent, Currency.TRY)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Bütçe</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(budget.amount, Currency.TRY)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Kalan</Text>
          <Text style={[styles.amountValue, { color: colors.textSecondary }]}>
            {formatCurrency(budget.remaining, Currency.TRY)}
          </Text>
        </View>
      </View>

      {/* Status Badge */}
      {budget.percentageUsed >= 80 && (
        <View
          style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}
        >
          <MaterialCommunityIcons
            name={budget.percentageUsed >= 100 ? "alert-circle" : "alert"}
            size={16}
            color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {budget.percentageUsed >= 100 ? "Bütçe Aşıldı!" : "Uyarı: %80 Üstü"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
  },
  budgetName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  percentage: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 45,
    textAlign: "right",
  },
  amountsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  amountItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
