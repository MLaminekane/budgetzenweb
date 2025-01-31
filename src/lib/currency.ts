export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  const currencyMap: Record<string, { symbol: string, position: 'after' | 'before', decimals: boolean }> = {
    XOF: { symbol: 'FCFA', position: 'after', decimals: false },
    EUR: { symbol: '€', position: 'after', decimals: false },
    USD: { symbol: '$', position: 'after', decimals: true },
    CAD: { symbol: '$', position: 'after', decimals: true },
  };

  const { symbol, position, decimals } = currencyMap[currency] || currencyMap.EUR;
  const formattedAmount = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });

  return position === 'before' 
    ? `${symbol}${formattedAmount}`
    : `${formattedAmount} ${symbol}`;
};
