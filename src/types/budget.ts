import { Currency } from "../constants/enums";

export interface BudgetDto {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  currency: string;
  periodStartDate: string;
  periodEndDate: string;
  alertThresholdPercentage: number;
  alertWhenExceeded: boolean;
  isActive: boolean;
  createdAt: string;
  spent: number; // Backend hesaplıyor
  remaining: number; // Backend hesaplıyor
  percentageUsed: number; // Backend hesaplıyor
  status: string; // "Normal", "Warning", "Exceeded"
}

export interface CreateBudgetRequest {
  categoryId: string;
  name: string;
  amount: number;
  currency: Currency;
  startDate: string;
  endDate: string;
  alertThresholdPercentage: number;
}

export interface UpdateBudgetRequest {
  name: string;
  amount: number;
  currency: Currency;
  startDate: string;
  endDate: string;
  alertThresholdPercentage: number;
}
