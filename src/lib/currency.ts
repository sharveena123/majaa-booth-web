export function formatRM(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function outstandingBalance(totalPrice: number, deposit: number): number {
  return Math.max(0, totalPrice - deposit);
}
