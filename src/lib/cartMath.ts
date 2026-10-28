import { CartItem, SelectedExtraOption } from "@/types/menu";

/**
 * Floating-Point Precision Koruyucusu (Kuruş/Cent tabanlı matematik)
 * JavaScript'te 0.1 + 0.2 = 0.30000000000000004 hatasını 
 * kuruş/cent tabanlı tamsayı işlemine çevirerek %100 önler.
 */

export function toCents(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Tek bir ürünün ekstralar dahil birim fiyatını kuruş hassasiyetinde hesaplar
 */
export function calculateItemUnitPrice(
  basePrice: number,
  selectedOptions: SelectedExtraOption[] = []
): number {
  const baseCents = toCents(basePrice);
  const extrasCents = selectedOptions.reduce(
    (sum, opt) => sum + toCents(opt.price || 0),
    0
  );
  return fromCents(baseCents + extrasCents);
}

/**
 * Satır toplamını hesaplar (Birim Fiyat * Miktar)
 */
export function calculateLineTotal(unitPrice: number, quantity: number): number {
  const safeQty = Math.max(1, Math.floor(quantity || 1));
  const unitCents = toCents(unitPrice);
  return fromCents(unitCents * safeQty);
}

/**
 * Sepetin toplam tutarını ve ürün sayısını hesaplar
 */
export function calculateCartSummary(cart: CartItem[] = []): {
  total: number;
  itemCount: number;
} {
  let totalCents = 0;
  let totalCount = 0;

  for (const item of cart) {
    const unitPrice = calculateItemUnitPrice(
      item.product.price,
      item.selectedOptions
    );
    const lineTotal = calculateLineTotal(unitPrice, item.quantity);
    totalCents += toCents(lineTotal);
    totalCount += Math.max(1, Math.floor(item.quantity || 1));
  }

  return {
    total: fromCents(totalCents),
    itemCount: totalCount,
  };
}

/**
 * Para formatlama (₺145,00 veya ₺145)
 */
export function formatMoney(amount: number): string {
  const safe = fromCents(toCents(amount));
  return `₺${safe.toLocaleString("tr-TR", {
    minimumFractionDigits: safe % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
