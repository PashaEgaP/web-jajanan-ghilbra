export function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateCartTotals(cart) {
  return cart.reduce(
    (acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;
      acc.totalItems += qty;
      acc.totalPrice += price * qty;
      return acc;
    },
    { totalItems: 0, totalPrice: 0 },
  );
}
