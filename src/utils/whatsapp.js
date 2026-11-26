export const WHATSAPP_NUMBER = "6285871451703";

export function formatRupiah(amount) {
  return `Rp ${Number(amount).toLocaleString("id-ID")}`;
}

export function buildProductWhatsAppUrl(product, quantity = 1) {
  const unitPrice = formatRupiah(product.price);
  const total = formatRupiah(product.price * quantity);
  const itemLine =
    quantity > 1
      ? `${quantity}x ${product.name} (${unitPrice} x ${quantity} = ${total})`
      : `${product.name} (${unitPrice})`;

  const message = `Halo Jajanan Ghilbra, saya ingin pesan ${itemLine}. Mohon info ketersediaan dan total pembayarannya.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppUrl(customText) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(customText)}`;
}
