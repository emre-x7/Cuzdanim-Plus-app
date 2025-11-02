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
import { Currency } from "../../constants/enums";
import { BudgetDto, CreateBudgetRequest } from "../../types/budget";
import { useCategories } from "../../hooks/useCategories";
import { useCreateBudget, useUpdateBudget } from "../../hooks/useBudgets";
import Picker from "../common/Picker";
import DatePicker from "../common/DatePicker";

// Validation schema
const budgetSchema = z.object({
  categoryId: z.string().min(1, "Kategori seçiniz"),
  name: z
    .string()
    .min(1, "Bütçe adı gerekli")
    .max(100, "En fazla 100 karakter"),
  amount: z.number().positive("Tutar 0'dan büyük olmalı"),
  startDate: z.date(),
  endDate: z.date(),
  alertThresholdPercentage: z.number().min(50).max(100),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormModalProps {
  visible: boolean;
  onClose: () => void;
  budget?: BudgetDto | null;
}

export default function BudgetFormModal({
  visible,
  onClose,
  budget,
}: BudgetFormModalProps) {
  const isEditMode = !!budget;

  const { data: categories } = useCategories();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();

  // Sadece Expense kategorileri (Bütçe sadece gider için)
  const expenseCategories = categories?.filter(
    (cat) => cat.transactionType === "Expense"
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: "",
      name: "",
      amount: 0,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      alertThresholdPercentage: 80,
    },
  });

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (budget && visible) {
      setValue("categoryId", budget.categoryId);
      setValue("name", budget.name);
      setValue("amount", budget.amount);
      setValue("startDate", new Date(budget.periodStartDate));
      setValue("endDate", new Date(budget.periodEndDate));
      setValue("alertThresholdPercentage", budget.alertThresholdPercentage);
    } else if (!visible) {
      reset();
    }
  }, [budget, visible, setValue, reset]);

  const onSubmit = async (data: BudgetFormData) => {
    try {
      if (isEditMode && budget) {
        // Güncelleme
        await updateMutation.mutateAsync({
          id: budget.id,
          data: {
            name: data.name,
            amount: data.amount,
            currency: Currency.TRY,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            alertThresholdPercentage: data.alertThresholdPercentage,
          },
        });
        Alert.alert("Başarılı", "Bütçe güncellendi");
      } else {
        // Yeni oluşturma
        const createData: CreateBudgetRequest = {
          categoryId: data.categoryId,
          name: data.name,
          amount: data.amount,
          currency: Currency.TRY,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          alertThresholdPercentage: data.alertThresholdPercentage,
        };
        await createMutation.mutateAsync(createData);
        Alert.alert("Başarılı", "Bütçe oluşturuldu");
      }
      onClose();
      reset();
    } catch (error: any) {
      Alert.alert("Hata", error.message || "İşlem başarısız");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const categoryOptions =
    expenseCategories?.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })) || [];

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
              {isEditMode ? "Bütçe Düzenle" : "Yeni Bütçe"}
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
            {/* Kategori (sadece yeni bütçe) */}
            {!isEditMode && (
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
            )}

            {/* Bütçe Adı */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bütçe Adı *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Örn: Aylık Market Bütçesi"
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

            {/* Tutar */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bütçe Tutarı *</Text>
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

            {/* Başlangıç Tarihi */}
            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Başlangıç Tarihi *"
                  value={value}
                  onChange={onChange}
                  error={errors.startDate?.message}
                />
              )}
            />

            {/* Bitiş Tarihi */}
            <Controller
              control={control}
              name="endDate"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Bitiş Tarihi *"
                  value={value}
                  onChange={onChange}
                  error={errors.endDate?.message}
                />
              )}
            />

            {/* Uyarı Eşiği */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Uyarı Eşiği (%)</Text>
              <Text style={styles.helperText}>
                Bütçenizin bu yüzdesine ulaşınca uyarı alırsınız
              </Text>
              <Controller
                control={control}
                name="alertThresholdPercentage"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="80"
                    value={value?.toString()}
                    onChangeText={(text) => {
                      const numValue = parseInt(text) || 80;
                      onChange(numValue);
                    }}
                    onBlur={onBlur}
                    keyboardType="number-pad"
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
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
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
