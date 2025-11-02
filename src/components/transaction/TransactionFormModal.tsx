import React, { useEffect, useState } from "react";
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
import { TransactionType, Currency } from "../../constants/enums";
import {
  TransactionDto,
  CreateTransactionRequest,
} from "../../types/transaction";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories } from "../../hooks/useCategories";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "../../hooks/useTransactions";
import Picker from "../common/Picker";
import DatePicker from "../common/DatePicker";

// Validation schema
const transactionSchema = z.object({
  type: z.number().min(1, "İşlem tipi seçiniz"),
  accountId: z.string().min(1, "Hesap seçiniz"),
  categoryId: z.string().min(1, "Kategori seçiniz"),
  amount: z.number().positive("Tutar 0'dan büyük olmalı"),
  transactionDate: z.date(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: TransactionDto | null;
}

export default function TransactionFormModal({
  visible,
  onClose,
  transaction,
}: TransactionFormModalProps) {
  const isEditMode = !!transaction;
  const [selectedType, setSelectedType] = useState<TransactionType>(
    TransactionType.Expense
  );

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: TransactionType.Expense,
      accountId: "",
      categoryId: "",
      amount: 0,
      transactionDate: new Date(),
      description: "",
      notes: "",
    },
  });

  const watchType = watch("type");

  // Tip değiştiğinde kategori listesini filtrele
  const filteredCategories = categories?.filter((cat) => {
    if (watchType === TransactionType.Income) {
      return cat.transactionType === "Income";
    } else if (watchType === TransactionType.Expense) {
      return cat.transactionType === "Expense";
    }
    return true;
  });

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (transaction && visible) {
      const typeValue =
        transaction.type === "Income"
          ? TransactionType.Income
          : TransactionType.Expense;
      setValue("type", typeValue);
      setSelectedType(typeValue);
      setValue("accountId", transaction.accountId);
      setValue("categoryId", transaction.categoryId);
      setValue("amount", transaction.amount);
      setValue("transactionDate", new Date(transaction.transactionDate));
      setValue("description", transaction.description || "");
      setValue("notes", transaction.notes || "");
    } else if (!visible) {
      reset();
      setSelectedType(TransactionType.Expense);
    }
  }, [transaction, visible, setValue, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (isEditMode && transaction) {
        // Güncelleme
        await updateMutation.mutateAsync({
          id: transaction.id,
          data: {
            categoryId: data.categoryId,
            amount: data.amount,
            currency: Currency.TRY,
            transactionDate: data.transactionDate.toISOString(),
            description: data.description,
            notes: data.notes,
          },
        });
        Alert.alert("Başarılı", "İşlem güncellendi");
      } else {
        // Yeni oluşturma
        const createData: CreateTransactionRequest = {
          accountId: data.accountId,
          categoryId: data.categoryId,
          type: data.type,
          amount: data.amount,
          currency: Currency.TRY,
          transactionDate: data.transactionDate.toISOString(),
          description: data.description,
          notes: data.notes,
        };
        await createMutation.mutateAsync(createData);
        Alert.alert("Başarılı", "İşlem oluşturuldu");
      }
      onClose();
      reset();
    } catch (error: any) {
      Alert.alert("Hata", error.message || "İşlem başarısız");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Hesap ve kategori seçenekleri
  const accountOptions =
    accounts?.map((acc) => ({
      label: acc.name,
      value: acc.id,
    })) || [];

  const categoryOptions =
    filteredCategories?.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })) || [];

  const typeOptions = [
    { label: "Gelir", value: TransactionType.Income },
    { label: "Gider", value: TransactionType.Expense },
  ];

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
              {isEditMode ? "İşlem Düzenle" : "Yeni İşlem"}
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
            {/* İşlem Tipi (sadece yeni işlem) */}
            {!isEditMode && (
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <Picker
                    label="İşlem Tipi *"
                    placeholder="Seçiniz"
                    value={value}
                    options={typeOptions}
                    onValueChange={(val) => {
                      onChange(val);
                      setSelectedType(val as TransactionType);
                      // Tip değiştiğinde kategoriyi sıfırla
                      setValue("categoryId", "");
                    }}
                    error={errors.type?.message}
                  />
                )}
              />
            )}

            {/* Hesap */}
            {!isEditMode && (
              <Controller
                control={control}
                name="accountId"
                render={({ field: { onChange, value } }) => (
                  <Picker
                    label="Hesap *"
                    placeholder="Hesap seçiniz"
                    value={value}
                    options={accountOptions}
                    onValueChange={onChange}
                    error={errors.accountId?.message}
                  />
                )}
              />
            )}

            {/* Kategori */}
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { onChange, value } }) => (
                <Picker
                  label="Kategori *"
                  placeholder="Kategori seçiniz"
                  value={value}
                  options={categoryOptions}
                  onValueChange={onChange}
                  error={errors.categoryId?.message}
                />
              )}
            />

            {/* Tutar */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tutar *</Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.amount && styles.inputError]}
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
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount.message}</Text>
              )}
            </View>

            {/* Tarih */}
            <Controller
              control={control}
              name="transactionDate"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Tarih *"
                  value={value}
                  onChange={onChange}
                  error={errors.transactionDate?.message}
                />
              )}
            />

            {/* Açıklama */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Açıklama</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Market alışverişi"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isLoading}
                  />
                )}
              />
            </View>

            {/* Notlar */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notlar</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Ekstra notlar..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    editable={!isLoading}
                  />
                )}
              />
            </View>
          </ScrollView>

          {/* Footer */}
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
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
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
