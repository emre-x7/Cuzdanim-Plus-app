import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GoalDto } from "../../types/goal";
import { colors } from "../../constants/colors";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { Currency } from "../../constants/enums";

interface GoalCardProps {
  goal: GoalDto;
  onPress?: () => void;
  onContribute?: () => void;
}

export default function GoalCard({
  goal,
  onPress,
  onContribute,
}: GoalCardProps) {
  const isCompleted = goal.status === "Completed";
  const progressColor = isCompleted ? colors.success : colors.primary;
  const progressWidth = Math.min(goal.progressPercentage, 100);

  // Durum ikonu
  const getStatusIcon = () => {
    switch (goal.status) {
      case "Completed":
        return "check-circle";
      case "Paused":
        return "pause-circle";
      case "Cancelled":
        return "close-circle";
      default:
        return "target";
    }
  };

  // Durum rengi
  const getStatusColor = () => {
    switch (goal.status) {
      case "Completed":
        return colors.success;
      case "Paused":
        return colors.warning;
      case "Cancelled":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.goalInfo}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${progressColor}15` },
            ]}
          >
            <MaterialCommunityIcons
              name={(goal.icon as any) || getStatusIcon()}
              size={28}
              color={progressColor}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.goalName}>{goal.name}</Text>
            {goal.description && (
              <Text style={styles.description} numberOfLines={1}>
                {goal.description}
              </Text>
            )}
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor()}15` },
          ]}
        >
          <MaterialCommunityIcons
            name={getStatusIcon()}
            size={16}
            color={getStatusColor()}
          />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressWidth}%`, backgroundColor: progressColor },
            ]}
          />
        </View>
        <Text style={[styles.percentage, { color: progressColor }]}>
          %{goal.progressPercentage.toFixed(0)}
        </Text>
      </View>

      {/* Amounts */}
      <View style={styles.amountsContainer}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Biriken</Text>
          <Text style={[styles.amountValue, { color: progressColor }]}>
            {formatCurrency(goal.currentAmount, Currency.TRY)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Hedef</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(goal.targetAmount, Currency.TRY)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Kalan</Text>
          <Text style={[styles.amountValue, { color: colors.textSecondary }]}>
            {formatCurrency(goal.remainingAmount, Currency.TRY)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <MaterialCommunityIcons
            name="calendar"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.dateText}>
            {goal.daysRemaining > 0
              ? `${goal.daysRemaining} gün kaldı`
              : goal.daysRemaining === 0
              ? "Bugün bitiyor"
              : "Süresi doldu"}
          </Text>
        </View>
        {!isCompleted && goal.status === "Active" && (
          <TouchableOpacity
            style={styles.contributeButton}
            onPress={(e) => {
              e.stopPropagation();
              onContribute?.();
            }}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#fff" />
            <Text style={styles.contributeButtonText}>Katkı Ekle</Text>
          </TouchableOpacity>
        )}
      </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 20,
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
    marginBottom: 16,
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
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  contributeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  contributeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});
