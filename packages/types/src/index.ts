// Restaurant (tenant)
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  restaurant_type: string | null;
  phone: string | null;
  email: string | null;
  gst_number: string | null;
  currency: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Additional Settings Fields (Migration 014)
  description?: string | null;
  cover_image_url?: string | null;
  website?: string | null;
  pan_number?: string | null;
  business_registration?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  accent_color?: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  business_days?: string[] | null;
  business_address?: string | null;
  date_format?: string | null;
  time_format?: string | null;
  language?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  accept_orders?: boolean;
  enable_table_ordering?: boolean;
  kitchen_display_enabled?: boolean;
  email_notifications?: boolean;
  kitchen_alerts?: boolean;
  order_alerts?: boolean;
  settings_json?: Record<string, any> | null;
}

export interface UpdateRestaurantSettingsPayload {
  name?: string;
  slug?: string;
  restaurant_type?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  accent_color?: string | null;
  gst_number?: string | null;
  pan_number?: string | null;
  business_registration?: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  business_days?: string[] | null;
  business_address?: string | null;
  currency?: string;
  timezone?: string;
  date_format?: string | null;
  time_format?: string | null;
  language?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  accept_orders?: boolean;
  enable_table_ordering?: boolean;
  kitchen_display_enabled?: boolean;
  email_notifications?: boolean;
  kitchen_alerts?: boolean;
  order_alerts?: boolean;
  settings_json?: Record<string, any> | null;
}


// Roles (RBAC definition)
export interface Role {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  permissions_json: Record<string, any>;
  created_at: string;
}

// Restaurant Users (Auth Mappings)
export interface RestaurantUser {
  id: string;
  restaurant_id: string;
  auth_user_id: string;
  role_id: string | null;
  is_owner: boolean;
  created_at: string;
}

// Branches (Multiple Locations)
export interface Branch {
  id: string;
  restaurant_id: string;
  name: string;
  branch_code?: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  address_line2?: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_time: string | null;
  closing_time: string | null;
  business_days?: string[] | null;
  timezone?: string | null;
  is_active: boolean;
  is_default?: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchPayload {
  name: string;
  branch_code?: string;
  phone?: string;
  email?: string;
  address?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  opening_time?: string;
  closing_time?: string;
  business_days?: string[];
  timezone?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface UpdateBranchPayload extends Partial<CreateBranchPayload> {
  is_archived?: boolean;
}

export type BranchFilterType = 'all' | 'active' | 'inactive' | 'archived';

export type StaffRole = 'owner' | 'manager' | 'staff' | 'kitchen';

// Staff (Operations Personnel)
export interface Staff {
  id: string;
  restaurant_id: string;
  branch_id: string | null;
  role_id: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

// -------------------------------------------------------------
// Future Placeholders (Kept for compatibility with core checks)
// -------------------------------------------------------------
// Menu Categories
export interface Category {
  id: string;
  restaurant_id: string;
  branch_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  bg_color: string;
  text_color: string;
  is_visible: boolean;
  is_active: boolean;
  is_featured: boolean;
  available_from: string | null;
  available_until: string | null;
  available_days: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

/** @deprecated Use Category instead */
export type MenuCategory = Category;

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string | null;
  icon?: string | null;
  sort_order?: number;
  bg_color?: string;
  text_color?: string;
  is_visible?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  available_from?: string | null;
  available_until?: string | null;
  available_days?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  branch_id?: string | null;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

export type CategoryFilterType = 'all' | 'active' | 'inactive' | 'featured' | 'archived';

// -------------------------------------------------------------
// Menu Item Types
// -------------------------------------------------------------
export type MenuItemStatus = 'available' | 'unavailable' | 'hidden' | 'out_of_stock' | 'coming_soon' | 'discontinued';

export type DietaryTag =
  | 'veg'
  | 'non_veg'
  | 'vegan'
  | 'egg'
  | 'halal'
  | 'jain'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'spicy'
  | 'chef_special'
  | 'new_item'
  | 'best_seller'
  | 'seasonal';

export interface MenuItemGalleryImage {
  url: string;
  sort_order: number;
  alt?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  branch_id: string | null;

  // Identity
  name: string;
  short_name: string | null;
  slug: string;
  description: string | null;
  short_description: string | null;

  // Pricing
  base_price: number;
  compare_at_price: number | null;
  tax_category: string | null;

  // Codes
  sku: string | null;
  internal_code: string | null;
  barcode: string | null;

  // Media
  image_url: string | null;
  gallery_json: MenuItemGalleryImage[];

  // Dietary & Tags
  dietary_tags: DietaryTag[];
  allergens: string[];

  // Operations
  preparation_time: number | null;
  calories: number | null;
  spice_level: number;

  // Status
  status: MenuItemStatus;

  // Display & Sorting
  sort_order: number;
  is_featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_chef_special: boolean;
  is_seasonal: boolean;

  // Availability Schedule
  available_from: string | null;
  available_until: string | null;
  available_days: string[] | null;

  // Branch Availability
  branch_availability: string[];

  // Extensibility
  metadata_json: Record<string, any>;

  // Audit
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface MenuItemWithCategory extends MenuItem {
  category?: Category;
}

export interface CreateMenuItemPayload {
  name: string;
  short_name?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  category_id: string;
  branch_id?: string | null;
  base_price: number;
  compare_at_price?: number | null;
  tax_category?: string | null;
  sku?: string | null;
  internal_code?: string | null;
  barcode?: string | null;
  image_url?: string | null;
  gallery_json?: MenuItemGalleryImage[];
  dietary_tags?: DietaryTag[];
  allergens?: string[];
  preparation_time?: number | null;
  calories?: number | null;
  spice_level?: number;
  status?: MenuItemStatus;
  sort_order?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_best_seller?: boolean;
  is_chef_special?: boolean;
  is_seasonal?: boolean;
  available_from?: string | null;
  available_until?: string | null;
  available_days?: string[] | null;
  branch_availability?: string[];
  metadata_json?: Record<string, any>;
}

export interface UpdateMenuItemPayload extends Partial<CreateMenuItemPayload> {}

export type MenuItemFilterType = 'all' | 'active' | 'inactive' | 'featured' | 'out_of_stock' | 'archived';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'inactive';

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  label: string | null;
  capacity: number;
  qr_code_url: string | null;
  status: TableStatus;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served';

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string;
  customer_name: string | null;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  table?: Table;
}

export interface OrderItem {
  id: string;
  order_id: string;
  restaurant_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  status: OrderItemStatus;
  created_at: string;
  menu_item?: MenuItem;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// -------------------------------------------------------------
// Media Foundation Types
// -------------------------------------------------------------
export type MediaType = 'logo' | 'category' | 'menu' | 'banner' | 'staff' | 'offer' | 'qr' | 'marketing';
export type ImageVariant = 'thumb' | 'small' | 'medium' | 'large' | 'original';

export interface MediaAsset {
  id: string;
  restaurant_id: string;
  entity_type: MediaType;
  entity_id: string | null;
  bucket: string;
  storage_path: string;
  public_url: string;
  variants_json: Record<ImageVariant, string>;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MediaPresetConfig {
  entityType: MediaType;
  maxInputSizeBytes: number;        // Max accepted input size (50MB default)
  allowedMimeTypes: string[];
  targetQuality: number;            // Starting quality for adaptive loop (e.g. 0.85)
  targetSizeRange: {                // Adaptive compression target range in bytes
    min: number;
    max: number;
  };
  dimensions: {                     // Target output dimensions
    width: number;
    height: number;
  };
  variants: ImageVariant[];
}

export interface UploadMediaOptions {
  restaurantId: string;
  entityType: MediaType;
  entityId?: string;
  userId?: string;
  quality?: number;
  customPath?: string;
}

export interface ProcessedImageResult {
  originalBlob: Blob;
  variants: Partial<Record<ImageVariant, Blob>>;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
}

export interface MediaUrls {
  originalUrl: string;
  variantsUrlMap: Partial<Record<ImageVariant, string>>;
  srcset: string;
}

