/**
 * Public Customer API Data Transfer Objects (DTOs)
 * Clean, sanitized models exposed exclusively to the Customer Application.
 * Excludes internal IDs, owner credentials, admin settings, and private security metadata.
 */

export interface PublicRestaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  restaurant_type: string | null;
  phone: string | null;
  website: string | null;
  currency: string;
  timezone: string;
  opening_time: string | null;
  closing_time: string | null;
  business_days: string[] | null;
  business_address: string | null;
  accept_orders: boolean;
  enable_table_ordering: boolean;
  status: 'active' | 'inactive' | 'suspended';
}

export interface PublicBranding {
  name: string;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  description: string | null;
}

export interface PublicBranch {
  id: string;
  name: string;
  branch_code: string | null;
  address: string | null;
  phone: string | null;
  is_active: boolean;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  bg_color: string;
  text_color: string;
  is_featured: boolean;
  available_from: string | null;
  available_until: string | null;
  available_days: string[] | null;
}

export interface PublicProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  is_default: boolean;
  is_available: boolean;
}

export interface PublicModifierOption {
  id: string;
  name: string;
  price_override: number | null;
  is_default: boolean;
  is_available: boolean;
}

export interface PublicModifierGroup {
  id: string;
  name: string;
  description: string | null;
  min_selection: number;
  max_selection: number;
  is_required: boolean;
  options: PublicModifierOption[];
}

export interface PublicMenuItem {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  price: number;
  base_price?: number;
  compare_at_price: number | null;
  preparation_time_minutes: number | null;
  is_featured: boolean;
  is_spicy: boolean;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_halal: boolean;
  dietary_tags: string[];
  status: 'available' | 'unavailable' | 'hidden' | 'out_of_stock' | 'coming_soon' | 'discontinued';
  sort_order: number;
  variants?: PublicProductVariant[];
  modifier_groups?: PublicModifierGroup[];
}

export interface PublicTable {
  id: string;
  table_number: string;
  table_token: string;
  label: string | null;
  capacity: number;
  seating_capacity?: number;
  section: string | null;
  floor: string | null;
  is_active: boolean;
}

export interface PublicRestaurantStatus {
  is_active: boolean;
  accept_orders: boolean;
  is_open: boolean;
  opening_time: string | null;
  closing_time: string | null;
  business_days: string[] | null;
  timezone: string;
}

export interface PublicMenuPayload {
  restaurant: PublicRestaurant;
  branding: PublicBranding;
  branch: PublicBranch | null;
  table: PublicTable | null;
  categories: PublicCategory[];
  items: PublicMenuItem[];
  status: PublicRestaurantStatus;
}

export interface PublicTableValidationResult {
  valid: boolean;
  restaurant: PublicRestaurant;
  branch: PublicBranch;
  table: PublicTable;
  error?: {
    code: 'RESTAURANT_NOT_FOUND' | 'RESTAURANT_UNAVAILABLE' | 'BRANCH_INACTIVE' | 'TABLE_NOT_FOUND' | 'TABLE_INACTIVE' | 'EXPIRED_TABLE_TOKEN';
    message: string;
  };
}

export interface PublicApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, any>;
}
