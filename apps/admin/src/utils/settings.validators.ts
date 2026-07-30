export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validatePhone(phone: string | null | undefined): string | null {
  if (!phone || !phone.trim()) return null; // Optional or validated as required elsewhere
  const clean = phone.replace(/[\s-()]/g, '');
  const phoneRegex = /^(\+91|\+?[1-9]\d{1,14})?[6-9]\d{9}$|^[1-9]\d{9,14}$/;
  if (!phoneRegex.test(clean)) {
    return 'Invalid phone number format. Please enter a valid 10-digit or international phone number.';
  }
  return null;
}

export function validateEmail(email: string | null | undefined): string | null {
  if (!email || !email.trim()) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Invalid email address format.';
  }
  return null;
}

export function validateGST(gst: string | null | undefined): string | null {
  if (!gst || !gst.trim()) return null;
  const clean = gst.trim().toUpperCase();
  // Standard Indian 15-digit GSTIN pattern: 22AAAAA0000A1Z5
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(clean)) {
    return 'Invalid GSTIN format (15 characters: e.g. 22AAAAA0000A1Z5).';
  }
  return null;
}

export function validatePAN(pan: string | null | undefined): string | null {
  if (!pan || !pan.trim()) return null;
  const clean = pan.trim().toUpperCase();
  // Standard Indian 10-digit PAN pattern: ABCDE1234F
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(clean)) {
    return 'Invalid PAN number format (10 characters: e.g. ABCDE1234F).';
  }
  return null;
}

export function validateSlug(slug: string | null | undefined): string | null {
  if (!slug || !slug.trim()) return 'Restaurant handle (slug) is required.';
  const clean = slug.trim();
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(clean)) {
    return 'Slug must contain only lowercase letters, numbers, and hyphens (e.g. my-restaurant).';
  }
  if (clean.length < 3) return 'Slug must be at least 3 characters long.';
  if (clean.length > 50) return 'Slug must be at most 50 characters long.';
  return null;
}

export function validateUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  try {
    const formatted = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    new URL(formatted);
    return null;
  } catch {
    return 'Invalid website URL format (e.g. https://example.com).';
  }
}
