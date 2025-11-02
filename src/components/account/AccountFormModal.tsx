import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { colors } from "../../constants/colors";
import { AccountType, Currency } from "../../constants/enums";
import { AccountDto, CreateAccountRequest } from "../../types/account";
import Picker from "../common/Picker";
import { useCreateAccount, useUpdateAccount } from "../../hooks/useAccounts";

// Validation schema
const accountSchema = z.object({
  name: z
    .string()
    .min(1, "Hesap adı gerekli")
    .max(100, "En fazla 100 karakter"),
  type: z.number().min(1, "Hesap tipi seçiniz"),
  initialBalance: z.number().min(0, "Bakiye 0 veya daha büyük olmalı"),
  currency: z.number().min(1, "Para birimi seçiniz"),
  bankName: z.string().optional(),
  iban: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormModalProps {
  visible: boolean;
  onClose: () => void;
  account?: AccountDto | null; // Düzenleme için
}

// Hesap tipi seçenekleri
const accountTypeOptions = [
  { label: "Banka Hesabı", value: AccountType.BankAccount },
  { label: "Kredi Kartı", value: AccountType.CreditCard },
  { label: "Nakit", value: AccountType.Cash },
  { label: "Dijital Cüzdan", value: AccountType.Wallet },
  { label: "Yatırım", value: AccountType.Investment },
];

// Para birimi seçenekleri
const currencyOptions = [
  { label: "Türk Lirası (₺)", value: Currency.TRY },
  { label: "Dolar ($)", value: Currency.USD },
  { label: "Euro (€)", value: Currency.EUR },
  { label: "Sterlin (£)", value: Currency.GBP },
];

export default function AccountFormModal({
  visible,
  onClose,
  account,
}: AccountFormModalProps) {
  const isEditMode = !!account;

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: AccountType.BankAccount,
      initialBalance: 0,
      currency: Currency.TRY,
      bankName: "",
      iban: "",
    },
  });

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (account && visible) {
      setValue("name", account.name);
      // Backend'den string geliyor, enum'a çevir
      const typeValue = AccountType[account.type as keyof typeof AccountType];
      setValue("type", typeValue || AccountType.BankAccount);
      setValue("initialBalance", account.balance);
      setValue("currency", Currency.TRY); // Backend'den currency string geliyor
      setValue("bankName", account.bankName || "");
      setValue("iban", account.iban || "");
    } else if (!visible) {
      reset();
    }
  }, [account, visible, setValue, reset]);

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (isEditMode && account) {
        // Güncelleme
        await updateMutation.mutateAsync({
          id: account.id,
          data: {
            name: data.name,
            isActive: account.isActive,
            includeInTotalBalance: true,
          },
        });
        Alert.alert("Başarılı", "Hesap güncellendi");
      } else {
        // Yeni oluşturma
        const createData: CreateAccountRequest = {
          name: data.name,
          type: data.type,
          initialBalance: data.initialBalance,
          currency: data.currency,
          bankName: data.bankName || undefined,
          iban: data.iban || undefined,
        };
        await createMutation.mutateAsync(createData);
        Alert.alert("Başarılı", "Hesap oluşturuldu");
      }
      onClose();
      reset();
    } catch (error: any) {
      Alert.alert("Hata", error.message || "İşlem başarısız");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditMode ? "Hesap Düzenle" : "Yeni Hesap"}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            {/* Hesap Adı */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hesap Adı *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Örn: Ziraat Bankası"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isLoading}
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
            </View>

            {/* Hesap Tipi */}
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <Picker
                  label="Hesap Tipi *"
                  placeholder="Hesap tipi seçiniz"
                  value={value}
                  options={accountTypeOptions}
                  onValueChange={onChange}
                  error={errors.type?.message}
                />
              )}
            />

            {/* Başlangıç Bakiyesi (sadece yeni hesap) */}
            {!isEditMode && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Başlangıç Bakiyesi *</Text>
                <Controller
                  control={control}
                  name="initialBalance"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        errors.initialBalance && styles.inputError,
                      ]}
                      placeholder="0.00"
                      value={value?.toString()}
                      onChangeText={(text) => {
                        const numValue = parseFloat(text) || 0;
                        onChange(numValue);
                      }}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                      editable={!isLoading}
                    />
                  )}
                />
                {errors.initialBalance && (
                  <Text style={styles.errorText}>
                    {errors.initialBalance.message}
                  </Text>
                )}
              </View>
            )}

            {/* Para Birimi */}
            {!isEditMode && (
              <Controller
                control={control}
                name="currency"
                render={({ field: { onChange, value } }) => (
                  <Picker
                    label="Para Birimi *"
                    placeholder="Para birimi seçiniz"
                    value={value}
                    options={currencyOptions}
                    onValueChange={onChange}
                    error={errors.currency?.message}
                  />
                )}
              />
            )}

            {/* Banka Adı (Opsiyonel) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Banka Adı</Text>
              <Controller
                control={control}
                name="bankName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Ziraat Bankası"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isLoading}
                  />
                )}
              />
            </View>

            {/* IBAN (Opsiyonel) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>IBAN</Text>
              <Controller
                control={control}
                name="iban"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isLoading}
                    autoCapitalize="characters"
                  />
                )}
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditMode ? "Güncelle" : "Oluştur"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
