import { CurrencySymbols, Currency } from "../constants/enums";

export const formatCurrency = (
  amount: number,
  currency: Currency = Currency.TRY
): string => {
  const symbol = CurrencySymbols[currency];

  // Türkçe format: 1.234,56
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${symbol}`;
};
