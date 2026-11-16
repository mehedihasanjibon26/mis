
export type DisplayLanguage = "en" | "bn";

const locale = (lang: DisplayLanguage) =>
  lang === "bn" ? "bn-BD" : "en-BD";

export function formatNumber(
  value: number,
  lang: DisplayLanguage,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale(lang), options).format(value);
}

export function formatMoney(
  value: number,
  lang: DisplayLanguage
): string {
  return `৳${formatNumber(value, lang)}`;
}

export function formatPercent(
  value: number,
  lang: DisplayLanguage,
  maximumFractionDigits = 1
): string {
  return `${formatNumber(value, lang, {
    maximumFractionDigits,
  })}%`;
}

export function formatDate(
  value: string | number | Date,
  lang: DisplayLanguage
): string {
  return new Intl.DateTimeFormat(locale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
