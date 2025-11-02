import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  VictoryPie,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryLine,
} from "victory";
import { useReports } from "../hooks/useReports";
import { colors } from "../constants/colors";
import { formatCurrency } from "../utils/formatCurrency";
import { Currency } from "../constants/enums";

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  // Bu ay başlangıç ve bitiş tarihleri
  const today = new Date();
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1
  ); // Son 6 ay
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate] = useState(firstDayOfMonth.toISOString());
  const [endDate] = useState(lastDayOfMonth.toISOString());

  const {
    data: reports,
    isLoading,
    isError,
    error,
    refetch,
  } = useReports(startDate, endDate);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Loading
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Raporlar yükleniyor...</Text>
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
          {error?.message || "Raporlar yüklenemedi"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!reports) return null;

  // Pie Chart Data (Kategori Dağılımı - Sadece Giderler)
  const pieData = reports.categoryReport
    ? reports.categoryReport
        .filter((cat) => cat.totalAmount > 0)
        .slice(0, 5) // İlk 5 kategori
        .map((cat) => ({
          x: cat.categoryName,
          y: cat.totalAmount,
          label: `${cat.percentage.toFixed(0)}%`,
        }))
    : [];

  // Bar Chart Data (Aylık Gelir/Gider)
  const barData = reports.monthlyReport
    ? reports.monthlyReport.slice(-6).map((month) => ({
        month: month.monthName.substring(0, 3),
        income: month.income,
        expense: month.expense,
      }))
    : [];

  // Line Chart Data (Net Akış)
  const lineData = reports.monthlyReport
    ? reports.monthlyReport.slice(-6).map((month, index) => ({
        x: index + 1,
        y: month.net,
        label: month.monthName.substring(0, 3),
      }))
    : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Finansal Raporlar</Text>
        <Text style={styles.subtitle}>Son 6 Ay</Text>
      </View>

      {/* Özet Kartı */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons
              name="arrow-down"
              size={24}
              color={colors.income}
            />
            <Text style={styles.summaryLabel}>Toplam Gelir</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>
              {formatCurrency(reports.summary.totalIncome, Currency.TRY)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons
              name="arrow-up"
              size={24}
              color={colors.expense}
            />
            <Text style={styles.summaryLabel}>Toplam Gider</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>
              {formatCurrency(reports.summary.totalExpense, Currency.TRY)}
            </Text>
          </View>
        </View>
        <View style={styles.netContainer}>
          <Text style={styles.netLabel}>Net</Text>
          <Text
            style={[
              styles.netValue,
              {
                color:
                  reports.summary.netAmount >= 0
                    ? colors.success
                    : colors.error,
              },
            ]}
          >
            {formatCurrency(reports.summary.netAmount, Currency.TRY)}
          </Text>
        </View>
      </View>

      {/* Kategori Dağılımı (Pie Chart) */}
      {pieData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Kategori Dağılımı (Giderler)</Text>
          <VictoryPie
            data={pieData}
            width={screenWidth - 40}
            height={220}
            colorScale={["#6200EE", "#03DAC6", "#FF9800", "#4CAF50", "#F44336"]}
            padding={{ top: 20, bottom: 20, left: 50, right: 50 }}
            labelRadius={({ innerRadius }) => (innerRadius as number) + 30}
            style={{
              labels: { fontSize: 14, fontWeight: "bold", fill: "#fff" },
            }}
          />
          {/* Legend */}
          <View style={styles.legend}>
            {reports.categoryReport &&
              reports.categoryReport.slice(0, 5).map((cat, index) => (
                <View key={cat.categoryId} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      {
                        backgroundColor: [
                          "#6200EE",
                          "#03DAC6",
                          "#FF9800",
                          "#4CAF50",
                          "#F44336",
                        ][index],
                      },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {cat.categoryName} ({cat.percentage.toFixed(0)}%)
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Aylık Gelir/Gider (Bar Chart) */}
      {barData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Aylık Gelir & Gider</Text>
          <VictoryChart
            width={screenWidth - 40}
            height={250}
            theme={VictoryTheme.material}
            domainPadding={{ x: 20 }}
          >
            <VictoryAxis
              style={{
                tickLabels: { fontSize: 12, padding: 5 },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(tick) => `${(tick / 1000).toFixed(0)}k`}
              style={{
                tickLabels: { fontSize: 10 },
              }}
            />
            <VictoryBar
              data={barData.map((d) => ({ x: d.month, y: d.income }))}
              style={{ data: { fill: colors.income } }}
            />
            <VictoryBar
              data={barData.map((d) => ({ x: d.month, y: d.expense }))}
              style={{ data: { fill: colors.expense } }}
            />
          </VictoryChart>
          {/* Legend */}
          <View style={styles.barLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: colors.income }]}
              />
              <Text style={styles.legendText}>Gelir</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors.expense },
                ]}
              />
              <Text style={styles.legendText}>Gider</Text>
            </View>
          </View>
        </View>
      )}

      {/* Net Akış (Line Chart) */}
      {lineData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Net Akış Trendi</Text>
          <VictoryChart
            width={screenWidth - 40}
            height={250}
            theme={VictoryTheme.material}
          >
            <VictoryAxis
              tickValues={lineData.map((d) => d.x)}
              tickFormat={lineData.map((d) => d.label)}
              style={{
                tickLabels: { fontSize: 12, padding: 5 },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(tick) => `${(tick / 1000).toFixed(0)}k`}
              style={{
                tickLabels: { fontSize: 10 },
              }}
            />
            <VictoryLine
              data={lineData}
              style={{
                data: { stroke: colors.primary, strokeWidth: 3 },
              }}
              interpolation="natural"
            />
          </VictoryChart>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  netContainer: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  netLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  netValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  legend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
  },
  barLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 8,
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
});
