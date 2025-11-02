import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { colors } from "../../constants/colors";
import { Currency } from "../../constants/enums";
import { GoalDto } from "../../types/goal";
import { useAddContribution } from "../../hooks/useGoals";
import { formatCurrency } from "../../utils/formatCurrency";

// Validation schema
const contributionSchema = z.object({
  amount: z.number().positive("Tutar 0'dan büyük olmalı"),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface ContributionModalProps {
  visible: boolean;
  onClose: () => void;
  goal: GoalDto | null;
}

export default function ContributionModal({
  visible,
  onClose,
  goal,
}: ContributionModalProps) {
  const addContributionMutation = useAddContribution();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const onSubmit = async (data: ContributionFormData) => {
    if (!goal) return;

    try {
      await addContributionMutation.mutateAsync({
        id: goal.id,
        data: {
          amount: data.amount,
          currency: Currency.TRY,
        },
      });
      Alert.alert("Başarılı", `${data.amount.toFixed(2)} ₺ katkı eklendi`);
      onClose();
      reset();
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Katkı eklenemedi");
    }
  };

  if (!goal) return null;

  const isLoading = addContributionMutation.isPending;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="piggy-bank"
              size={32}
              color={colors.primary}
            />
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Katkı Ekle</Text>
          <Text style={styles.goalName}>{goal.name}</Text>

          {/* Progress Info */}
          <View style={styles.progressInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mevcut</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(goal.currentAmount, Currency.TRY)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hedef</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(goal.targetAmount, Currency.TRY)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kalan</Text>
              <Text style={[styles.infoValue, { color: colors.expense }]}>
                {formatCurrency(goal.remainingAmount, Currency.TRY)}
              </Text>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Katkı Tutarı *</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
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
                    autoFocus
                  />
                  <Text style={styles.currency}>₺</Text>
                </View>
              )}
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount.message}</Text>
            )}
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {[100, 500, 1000, 5000].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickButton}
                onPress={() => {
                  control._formValues.amount = amount;
                  control._subjects.state.next({
                    name: "amount",
                  } as any);
                }}
                disabled={isLoading}
              >
                <Text style={styles.quickButtonText}>{amount} ₺</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons */}
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
                <>
                  <MaterialCommunityIcons name="check" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Ekle</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  goalName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  progressInfo: {
    backgroundColor: `${colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#fff",
    color: colors.text,
  },
  currency: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 12,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    gap: 8,
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
