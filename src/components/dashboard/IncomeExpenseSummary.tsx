import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { formatCurrency } from "../../utils/formatCurrency";
import { Currency } from "../../constants/enums";

interface IncomeExpenseSummaryProps {
  income: number;
  expense: number;
  net: number;
}

export default function IncomeExpenseSummary({
  income,
  expense,
  net,
}: IncomeExpenseSummaryProps) {
  return (
    <View style={styles.container}>
      {/* Gelir */}
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="arrow-down"
            size={24}
            color={colors.income}
          />
        </View>
        <Text style={styles.label}>Gelir</Text>
        <Text style={[styles.amount, { color: colors.income }]}>
          {formatCurrency(income, Currency.TRY)}
        </Text>
      </View>

      {/* Gider */}
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="arrow-up"
            size={24}
            color={colors.expense}
          />
        </View>
        <Text style={styles.label}>Gider</Text>
        <Text style={[styles.amount, { color: colors.expense }]}>
          {formatCurrency(expense, Currency.TRY)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
