// AccountDto, CreateAccountCommand
import { AccountType, Currency } from "../constants/enums";

export interface AccountDto {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  bankName?: string;
  iban?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  initialBalance: number;
  currency: Currency;
  bankName?: string;
  iban?: string;
}

export interface UpdateAccountRequest {
  name: string;
  isActive: boolean;
  includeInTotalBalance: boolean;
}
