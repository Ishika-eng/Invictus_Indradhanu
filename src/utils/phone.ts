/**
 * Normalizes phone numbers to standard E.164 format.
 * Strips whitespace, dashes, and parentheses.
 * Automatically adds the +91 country prefix for 10-digit Indian numbers or handles leading 0.
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const trimmed = rawPhone.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!digitsOnly) return '';

  // 10-digit Indian mobile number (e.g., 9876543210)
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  // 11-digit with trunk prefix '0' (e.g., 09876543210)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `+91${digitsOnly.slice(1)}`;
  }

  // 12-digit already including country code 91 (e.g., 919876543210 or +91 98765 43210)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }

  // Any other international number with country code
  return `+${digitsOnly}`;
}
