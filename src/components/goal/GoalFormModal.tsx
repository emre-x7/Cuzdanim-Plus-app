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
import { GoalDto, CreateGoalRequest } from "../../types/goal";
import { useCreateGoal, useUpdateGoal } from "../../hooks/useGoals";
import DatePicker from "../common/DatePicker";

// Validation schema
const goalSchema = z.object({
  name: z
    .string()
    .min(1, "Hedef adı gerekli")
    .max(100, "En fazla 100 karakter"),
  description: z.string().optional(),
  targetAmount: z.number().positive("Hedef tutar 0'dan büyük olmalı"),
  targetDate: z.date(),
  icon: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormModalProps {
  visible: boolean;
  onClose: () => void;
  goal?: GoalDto | null;
}

// Hedef icon seçenekleri
const goalIcons = [
  { name: "car", label: "Araba" },
  { name: "home", label: "Ev" },
  { name: "airplane", label: "Tatil" },
  { name: "school", label: "Eğitim" },
  { name: "ring", label: "Düğün" },
  { name: "baby-carriage", label: "Bebek" },
  { name: "laptop", label: "Elektronik" },
  { name: "piggy-bank", label: "Birikim" },
];

export default function GoalFormModal({
  visible,
  onClose,
  goal,
}: GoalFormModalProps) {
  const isEditMode = !!goal;
  const [selectedIcon, setSelectedIcon] = React.useState("target");

  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: 0,
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      icon: "target",
    },
  });

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (goal && visible) {
      setValue("name", goal.name);
      setValue("description", goal.description || "");
      setValue("targetAmount", goal.targetAmount);
      setValue("targetDate", new Date(goal.targetDate));
      setSelectedIcon(goal.icon || "target");
      setValue("icon", goal.icon || "target");
    } else if (!visible) {
      reset();
      setSelectedIcon("target");
    }
  }, [goal, visible, setValue, reset]);

  const onSubmit = async (data: GoalFormData) => {
    try {
      if (isEditMode && goal) {
        // Güncelleme
        await updateMutation.mutateAsync({
          id: goal.id,
          data: {
            name: data.name,
            description: data.description,
            targetAmount: data.targetAmount,
            currency: Currency.TRY,
            targetDate: data.targetDate.toISOString(),
          },
        });
        Alert.alert("Başarılı", "Hedef güncellendi");
      } else {
        // Yeni oluşturma
        const createData: CreateGoalRequest = {
          name: data.name,
          description: data.description,
          targetAmount: data.targetAmount,
          currency: Currency.TRY,
          targetDate: data.targetDate.toISOString(),
          icon: selectedIcon,
        };
        await createMutation.mutateAsync(createData);
        Alert.alert("Başarılı", "Hedef oluşturuldu");
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
              {isEditMode ? "Hedef Düzenle" : "Yeni Hedef"}
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
            {/* İkon Seçimi (sadece yeni hedef) */}
            {!isEditMode && (
              <View style={styles.iconSection}>
                <Text style={styles.label}>İkon Seçin</Text>
                <View style={styles.iconGrid}>
                  {goalIcons.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={[
                        styles.iconButton,
                        selectedIcon === item.name && styles.iconButtonSelected,
                      ]}
                      onPress={() => {
                        setSelectedIcon(item.name);
                        setValue("icon", item.name);
                      }}
                    >
                      <MaterialCommunityIcons
                        name={item.name as any}
                        size={28}
                        color={
                          selectedIcon === item.name
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.iconLabel,
                          selectedIcon === item.name &&
                            styles.iconLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Hedef Adı */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hedef Adı *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Örn: Yeni Araba"
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

            {/* Açıklama */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Açıklama</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Hedef hakkında notlar..."
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

            {/* Hedef Tutar */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hedef Tutar *</Text>
              <Controller
                control={control}
                name="targetAmount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.targetAmount && styles.inputError,
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
              {errors.targetAmount && (
                <Text style={styles.errorText}>
                  {errors.targetAmount.message}
                </Text>
              )}
            </View>

            {/* Hedef Tarihi */}
            <Controller
              control={control}
              name="targetDate"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Hedef Tarihi *"
                  value={value}
                  onChange={onChange}
                  error={errors.targetDate?.message}
                />
              )}
            />
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
  iconSection: {
    marginBottom: 20,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconButton: {
    width: "22%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  iconButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  iconLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  iconLabelSelected: {
    color: colors.primary,
    fontWeight: "600",
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
