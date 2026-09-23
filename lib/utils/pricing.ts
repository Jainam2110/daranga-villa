export function formatCurrency(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "₹0";
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}
