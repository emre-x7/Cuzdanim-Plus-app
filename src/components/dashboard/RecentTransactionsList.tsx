import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RecentTransactionDto } from "../../types/dashboard";
import { colors } from "../../constants/colors";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { Currency } from "../../constants/enums";

interface RecentTransactionsListProps {
  transactions: RecentTransactionDto[];
}

export default function RecentTransactionsList({
  transactions,
}: RecentTransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="receipt-text-outline"
          size={48}
          color={colors.border}
        />
        <Text style={styles.emptyText}>Henüz işlem yok</Text>
      </View>
    );
  }

  const getIconName = (categoryIcon: string | null, type: string) => {
    // Geçerli icon adları için mapping
    const iconMap: { [key: string]: string } = {
      "food": "food",
      "transport": "car",
      "shopping": "shopping",
      "entertainment": "movie",
      "health": "medical-bag",
      "education": "school",
      "bills": "receipt",
      "salary": "cash-multiple",
      "investment": "chart-line",
      "other": "dots-horizontal"
    };

    if (categoryIcon && iconMap[categoryIcon.toLowerCase()]) {
      return iconMap[categoryIcon.toLowerCase()];
    }

    // Tip bazında fallback
    return type === "Income" ? "cash-plus" : "cash-minus";
  };

  const renderItem = ({ item }: { item: RecentTransactionDto }) => {
    const isIncome = item.type === "Income";
    const amountColor = isIncome ? colors.income : colors.expense;
    const iconName = getIconName(item.categoryIcon, item.type);

    return (
      <View style={styles.transactionItem}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={24}
            color={colors.primary}
          />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.categoryName}>{item.categoryName}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>
            {formatDate(item.transactionDate, "dd MMM")}
          </Text>
        </View>

        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? "+" : "-"}
          {formatCurrency(item.amount, Currency.TRY)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Son İşlemler</Text>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false} // Dashboard'ın kendi scroll'u var
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  transactionInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
});
