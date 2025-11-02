import { Currency, GoalStatus } from "../constants/enums";

export interface GoalDto {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string;
  status: string; // "Active", "Completed", "Cancelled", "Paused"
  progressPercentage: number;
  daysRemaining: number;
  remainingAmount: number;
  imageUrl?: string;
  icon?: string;
  isShared: boolean;
  createdAt: string;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  targetAmount: number;
  currency: Currency;
  targetDate: string;
  imageUrl?: string;
  icon?: string;
}

export interface UpdateGoalRequest {
  name: string;
  description?: string;
  targetAmount: number;
  currency: Currency;
  targetDate: string;
}

export interface AddContributionRequest {
  amount: number;
  currency: Currency;
}
