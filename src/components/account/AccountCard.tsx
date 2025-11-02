import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AccountDto } from "../../types/account";
import { colors } from "../../constants/colors";
import { formatCurrency } from "../../utils/formatCurrency";
import { Currency } from "../../constants/enums";

interface AccountCardProps {
  account: AccountDto;
  onPress?: () => void;
}

// Hesap tipine göre ikon
const getAccountIcon = (type: string) => {
  switch (type) {
    case "BankAccount":
      return "bank";
    case "CreditCard":
      return "credit-card";
    case "Cash":
      return "cash";
    case "Wallet":
      return "wallet";
    case "Investment":
      return "chart-line";
    default:
      return "wallet";
  }
};

// Hesap tipini Türkçe'ye çevir
const getAccountTypeLabel = (type: string): string => {
  switch (type) {
    case "BankAccount":
      return "Banka Hesabı";
    case "CreditCard":
      return "Kredi Kartı";
    case "Cash":
      return "Nakit";
    case "Wallet":
      return "Dijital Cüzdan";
    case "Investment":
      return "Yatırım";
    default:
      return type;
  }
};

export default function AccountCard({ account, onPress }: AccountCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, !account.isActive && styles.inactiveCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getAccountIcon(account.type) as any}
            size={28}
            color={colors.primary}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{account.name}</Text>
          <Text style={styles.type}>{getAccountTypeLabel(account.type)}</Text>
          {account.bankName && (
            <Text style={styles.bank}>{account.bankName}</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.balance}>
          {formatCurrency(account.balance, Currency.TRY)}
        </Text>
        {!account.isActive && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>Pasif</Text>
          </View>
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveCard: {
    opacity: 0.6,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  bank: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balance: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  inactiveBadge: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveBadgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
});
