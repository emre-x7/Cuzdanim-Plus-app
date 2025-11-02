import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TransactionDto } from "../../types/transaction";
import { colors } from "../../constants/colors";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { Currency } from "../../constants/enums";

interface TransactionCardProps {
  transaction: TransactionDto;
  onPress?: () => void;
}

export default function TransactionCard({
  transaction,
  onPress,
}: TransactionCardProps) {
  const isIncome = transaction.type === "Income";
  const amountColor = isIncome ? colors.income : colors.expense;
  const iconName = transaction.categoryName || "cash";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={(iconName as any) || "cash"}
          size={28}
          color={colors.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.category}>{transaction.categoryName}</Text>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount, Currency.TRY)}
          </Text>
        </View>

        {transaction.description && (
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.account}>{transaction.accountName}</Text>
          <Text style={styles.date}>
            {formatDate(transaction.transactionDate, "dd MMM yyyy")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  account: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
