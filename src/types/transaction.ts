import { TransactionType, Currency } from "../constants/enums";

export interface TransactionDto {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  type: string; // "Income" veya "Expense"
  amount: number;
  currency: string;
  transactionDate: string;
  description?: string;
  notes?: string;
  receiptUrl?: string;
  tags: string[];
  isAutoCategorized: boolean;
  createdAt: string;
}

export interface CreateTransactionRequest {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  transactionDate: string;
  description?: string;
  notes?: string;
  receiptUrl?: string;
  tags?: string[];
}

export interface UpdateTransactionRequest {
  categoryId: string;
  amount: number;
  currency: Currency;
  transactionDate: string;
  description?: string;
  notes?: string;
}
