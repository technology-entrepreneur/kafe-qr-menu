/**
 * Masa numarası normalizasyon yardımcıları
 * "Masa 1", "table 1", "  1  " -> "1" formatına normalize eder.
 */
export function normalizeTableNumber(raw?: string | null): string {
  if (!raw) return "";
  const cleaned = raw.replace(/^(masa|table)\s*/i, "").trim();
  return cleaned || raw.trim();
}

export function formatTableDisplay(raw?: string | null, lang: "tr" | "en" = "tr"): string {
  const norm = normalizeTableNumber(raw);
  if (!norm) return "";
  return lang === "en" ? `Table ${norm}` : `Masa ${norm}`;
}

