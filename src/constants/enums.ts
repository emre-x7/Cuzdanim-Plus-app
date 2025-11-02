// Backend'deki enum'ların frontend karşılıkları

export enum AccountType {
  BankAccount = 1,
  CreditCard = 2,
  Cash = 3,
  Wallet = 4,
  Investment = 5,
}

export enum TransactionType {
  Income = 1,
  Expense = 2,
  Transfer = 3,
}

export enum Currency {
  TRY = 1,
  USD = 2,
  EUR = 3,
  GBP = 4,
  GOLD = 5,
}

export enum GoalStatus {
  Active = 1,
  Completed = 2,
  Cancelled = 3,
  Paused = 4,
}

// Enum'ları label'a çevir (UI'da göstermek için)
export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.BankAccount]: "Banka Hesabı",
  [AccountType.CreditCard]: "Kredi Kartı",
  [AccountType.Cash]: "Nakit",
  [AccountType.Wallet]: "Dijital Cüzdan",
  [AccountType.Investment]: "Yatırım",
};

export const CurrencySymbols: Record<Currency, string> = {
  [Currency.TRY]: "₺",
  [Currency.USD]: "$",
  [Currency.EUR]: "€",
  [Currency.GBP]: "£",
  [Currency.GOLD]: "gr",
};
