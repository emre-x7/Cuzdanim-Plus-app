import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import { formatCurrency } from "../../utils/formatCurrency";
import { Currency } from "../../constants/enums";

interface BalanceCardProps {
  balance: number;
  currency: string;
}

export default function BalanceCard({ balance, currency }: BalanceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Toplam Bakiye</Text>
      <Text style={styles.amount}>{formatCurrency(balance, Currency.TRY)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
});
