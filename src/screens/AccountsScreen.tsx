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
import { useAccounts, useDeleteAccount } from "../hooks/useAccounts";
import { colors } from "../constants/colors";
import AccountCard from "../components/account/AccountCard";
import AccountFormModal from "../components/account/AccountFormModal";
import { AccountDto } from "../types/account";

export default function AccountsScreen() {
  const { data: accounts, isLoading, isError, error, refetch } = useAccounts();
  const deleteAccountMutation = useDeleteAccount();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountDto | null>(
    null
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAccountPress = (account: AccountDto) => {
    // Hesaba tıklandığında seçenekler göster
    Alert.alert(
      account.name,
      `Bakiye: ${account.balance} ${account.currency}\n\nNe yapmak istersiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Düzenle",
          onPress: () => {
            setSelectedAccount(account);
            setModalVisible(true);
          },
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => handleDeleteAccount(account),
        },
      ]
    );
  };

  const handleDeleteAccount = (account: AccountDto) => {
    Alert.alert(
      "Hesap Sil",
      `"${account.name}" hesabını silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccountMutation.mutateAsync(account.id);
              Alert.alert("Başarılı", "Hesap silindi");
            } catch (error: any) {
              Alert.alert("Hata", error.message || "Hesap silinemedi");
            }
          },
        },
      ]
    );
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAccount(null);
  };

  // Loading
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Hesaplar yükleniyor...</Text>
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
          {error?.message || "Hesaplar yüklenemedi"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty
  if (!accounts || accounts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="wallet-outline"
            size={80}
            color={colors.border}
          />
          <Text style={styles.emptyTitle}>Henüz hesap yok</Text>
          <Text style={styles.emptySubtitle}>
            İlk hesabınızı oluşturarak başlayın
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Hesap Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Modal */}
        <AccountFormModal
          visible={modalVisible}
          onClose={handleCloseModal}
          account={selectedAccount}
        />
      </View>
    );
  }

  // Success - List
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hesaplarım</Text>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={handleAddAccount}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={accounts}
        renderItem={({ item }) => (
          <AccountCard
            account={item}
            onPress={() => handleAccountPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal */}
      <AccountFormModal
        visible={modalVisible}
        onClose={handleCloseModal}
        account={selectedAccount}
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
