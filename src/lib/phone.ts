function digits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

/** Local Syrian numbers in settings are stored without a country code. */
export function internationalDigits(phone: string) {
  const raw = digits(phone).replace(/^0+/, "");
  if (raw.startsWith("963")) return raw;
  return `963${raw}`;
}

export function telHref(phone: string) {
  return `tel:+${internationalDigits(phone)}`;
}

export function whatsappHref(phone: string) {
  return `https://wa.me/${internationalDigits(phone)}`;
}
