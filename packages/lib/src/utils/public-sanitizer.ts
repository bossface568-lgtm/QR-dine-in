import {
  Restaurant,
  Category,
  MenuItem,
  Table,
  Branch,
  PublicRestaurant,
  PublicBranding,
  PublicCategory,
  PublicMenuItem,
  PublicTable,
  PublicBranch,
  PublicRestaurantStatus,
} from '@qrdine/types';

/**
 * Sanitizes a raw database Restaurant record into a public customer model.
 * Removes owner IDs, GST/PAN numbers, notification preferences, internal JSON, etc.
 */
export function sanitizeRestaurant(raw: Restaurant): PublicRestaurant {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    logo_url: raw.logo_url ?? null,
    cover_image_url: raw.cover_image_url ?? null,
    description: raw.description ?? null,
    restaurant_type: raw.restaurant_type ?? null,
    phone: raw.phone ?? null,
    website: raw.website ?? null,
    currency: raw.currency || 'INR',
    timezone: raw.timezone || 'Asia/Kolkata',
    opening_time: raw.opening_time ?? null,
    closing_time: raw.closing_time ?? null,
    business_days: raw.business_days ?? null,
    business_address: raw.business_address ?? null,
    accept_orders: raw.accept_orders ?? true,
    enable_table_ordering: raw.enable_table_ordering ?? true,
    status: raw.status || 'active',
  };
}

/**
 * Extracts public branding configuration for customer theme rendering.
 */
export function sanitizeBranding(raw: Restaurant): PublicBranding {
  return {
    name: raw.name,
    logo_url: raw.logo_url ?? null,
    cover_image_url: raw.cover_image_url ?? null,
    primary_color: raw.primary_color ?? '#f97316',
    secondary_color: raw.secondary_color ?? '#0f172a',
    accent_color: raw.accent_color ?? '#06b6d4',
    description: raw.description ?? null,
  };
}

/**
 * Sanitizes a Branch record for public customer consumption.
 */
export function sanitizeBranch(raw: Branch): PublicBranch {
  return {
    id: raw.id,
    name: raw.name,
    branch_code: raw.branch_code ?? null,
    address: raw.address ?? null,
    phone: raw.phone ?? null,
    is_active: raw.is_active ?? true,
  };
}

/**
 * Sanitizes a Category record for public customer menu display.
 */
export function sanitizeCategory(raw: Category): PublicCategory {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    image_url: raw.image_url ?? null,
    icon: raw.icon ?? null,
    sort_order: raw.sort_order ?? 0,
    bg_color: raw.bg_color || '#1e293b',
    text_color: raw.text_color || '#f8fafc',
    is_featured: raw.is_featured ?? false,
    available_from: raw.available_from ?? null,
    available_until: raw.available_until ?? null,
    available_days: raw.available_days ?? null,
  };
}

/**
 * Sanitizes a MenuItem record for public customer menu display.
 * Strips internal cost numbers, margins, supplier info, and audit timestamps.
 */
export function sanitizeMenuItem(raw: MenuItem): PublicMenuItem {
  const tags = (raw.dietary_tags || []).map((t) => String(t).toLowerCase());
  const gallery = Array.isArray(raw.gallery_json)
    ? raw.gallery_json.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
    : null;

  const price = Number(raw.base_price) || 0;

  return {
    id: raw.id,
    category_id: raw.category_id ?? null,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    image_url: raw.image_url ?? null,
    gallery_urls: gallery,
    price,
    base_price: price,
    compare_at_price: raw.compare_at_price ? Number(raw.compare_at_price) : null,
    preparation_time_minutes: raw.preparation_time ?? null,
    is_featured: raw.is_featured ?? false,
    is_spicy: (raw.spice_level ?? 0) > 0 || tags.includes('spicy'),
    is_vegan: tags.includes('vegan'),
    is_vegetarian: tags.includes('veg') || tags.includes('vegetarian'),
    is_gluten_free: tags.includes('gluten_free') || tags.includes('gluten-free'),
    is_halal: tags.includes('halal'),
    dietary_tags: tags,
    status: raw.status || 'available',
    sort_order: raw.sort_order ?? 0,
    variants: [],
    modifier_groups: [],
  };
}

/**
 * Sanitizes a Table record for customer table sessions.
 * Excludes internal QR generation version history, internal timestamps, and physical notes.
 */
export function sanitizeTable(raw: Table): PublicTable {
  return {
    id: raw.id,
    table_number: raw.table_number,
    table_token: raw.table_token,
    label: raw.label ?? null,
    capacity: raw.seating_capacity ?? 4,
    seating_capacity: raw.seating_capacity ?? 4,
    section: raw.section ?? null,
    floor: raw.floor ?? null,
    is_active: raw.is_active ?? true,
  };
}

/**
 * Computes restaurant operational status (open/closed/accepting orders).
 */
export function sanitizeRestaurantStatus(raw: Restaurant): PublicRestaurantStatus {
  const is_active = raw.status === 'active';
  const accept_orders = raw.accept_orders ?? true;

  // Simple open/closed evaluation based on business hours
  let is_open = is_active;
  if (raw.opening_time && raw.closing_time) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = raw.opening_time.split(':').map(Number);
    const [closeH, closeM] = raw.closing_time.split(':').map(Number);

    const openMinutes = openH * 60 + (openM || 0);
    const closeMinutes = closeH * 60 + (closeM || 0);

    if (closeMinutes > openMinutes) {
      is_open = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } else {
      // Overnight hours (e.g. 18:00 to 02:00)
      is_open = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }
  }

  return {
    is_active,
    accept_orders,
    is_open,
    opening_time: raw.opening_time ?? null,
    closing_time: raw.closing_time ?? null,
    business_days: raw.business_days ?? null,
    timezone: raw.timezone || 'Asia/Kolkata',
  };
}
