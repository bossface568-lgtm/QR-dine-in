import { OrderStatus, TableStatus, StaffRole, OrderItemStatus } from '@qrdine/types';

export const APP_NAME = 'QR Dine';
export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-500 border border-amber-500/20',
  confirmed: 'bg-blue-500/15 text-blue-500 border border-blue-500/20',
  preparing: 'bg-orange-500/15 text-orange-500 border border-orange-500/20 animate-pulse-soft',
  ready: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20',
  served: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  cancelled: 'bg-rose-500/15 text-rose-500 border border-rose-500/20',
};

export const ORDER_ITEM_STATUS_LABELS: Record<OrderItemStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
};

export const ORDER_ITEM_STATUS_COLORS: Record<OrderItemStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-400',
  preparing: 'bg-orange-500/10 text-orange-400',
  ready: 'bg-emerald-500/10 text-emerald-400',
  served: 'bg-slate-500/10 text-slate-400',
};

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  cleaning: 'Cleaning',
  inactive: 'Inactive',
};

export const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
  available: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20',
  occupied: 'bg-orange-500/15 text-orange-500 border border-orange-500/20',
  reserved: 'bg-blue-500/15 text-blue-500 border border-blue-500/20',
  cleaning: 'bg-amber-500/15 text-amber-500 border border-amber-500/20',
  inactive: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
};

export const FLOOR_OPTIONS = [
  'Ground Floor',
  'First Floor',
  'Second Floor',
  'Rooftop',
  'Terrace',
  'Outdoor Garden',
  'Mezzanine',
  'Basement',
];

export const SECTION_OPTIONS = [
  'Main Dining',
  'VIP Section',
  'Bar & Lounge',
  'Family Area',
  'Patio',
  'Garden Dining',
  'Private Dining Room',
  'Poolside',
];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Service Staff',
  kitchen: 'Kitchen Staff',
};

export const STAFF_ROLE_COLORS: Record<StaffRole, string> = {
  owner: 'bg-purple-500/15 text-purple-500 border border-purple-500/20',
  manager: 'bg-blue-500/15 text-blue-500 border border-blue-500/20',
  staff: 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/20',
  kitchen: 'bg-pink-500/15 text-pink-500 border border-pink-500/20',
};

export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  owner: ['all'],
  manager: [
    'menu.read', 'menu.write',
    'table.read', 'table.write',
    'order.read', 'order.write',
    'staff.read', 'staff.write',
    'settings.read', 'settings.write'
  ],
  staff: [
    'menu.read',
    'table.read', 'table.write',
    'order.read', 'order.write'
  ],
  kitchen: [
    'menu.read',
    'order.read', 'order.write'
  ]
};

// Restaurant Settings Constants
export const RESTAURANT_TYPES = [
  { value: 'fine_dining', label: 'Fine Dining' },
  { value: 'casual_dining', label: 'Casual Dining' },
  { value: 'fast_food', label: 'Fast Food / QSR' },
  { value: 'cafe', label: 'Café & Bakery' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'food_court', label: 'Food Court Stall' },
  { value: 'bar_pub', label: 'Bar & Lounge' },
  { value: 'cloud_kitchen', label: 'Cloud Kitchen' },
];

export const SUPPORTED_CURRENCIES = [
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
  { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
  { value: 'SGD', label: 'SGD ($) - Singapore Dollar' },
];

export const SUPPORTED_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST - UTC+05:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST - UTC+04:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT - UTC+08:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST - UTC+00:00)' },
  { value: 'America/New_York', label: 'America/New_York (EST - UTC-05:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST - UTC-08:00)' },
];

export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-12-31)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2026)' },
];

export const TIME_FORMATS = [
  { value: '12h', label: '12-Hour (02:30 PM)' },
  { value: '24h', label: '24-Hour (14:30)' },
];

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi (हिंदी)' },
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'ar', label: 'Arabic (العربية)' },
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// -------------------------------------------------------------
// Menu Item Status Constants
// -------------------------------------------------------------
export const MENU_ITEM_STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  unavailable: 'Unavailable',
  hidden: 'Hidden',
  out_of_stock: 'Out of Stock',
  coming_soon: 'Coming Soon',
  discontinued: 'Discontinued',
};

export const MENU_ITEM_STATUS_COLORS: Record<string, string> = {
  available: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20',
  unavailable: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  hidden: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  out_of_stock: 'bg-rose-500/15 text-rose-500 border border-rose-500/20',
  coming_soon: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  discontinued: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20',
};

// -------------------------------------------------------------
// Dietary Tag Definitions
// -------------------------------------------------------------
export const DIETARY_TAG_OPTIONS: { value: string; label: string; icon: string; color: string; bgColor: string }[] = [
  { value: 'veg', label: 'Vegetarian', icon: '🟢', color: 'text-green-500', bgColor: 'bg-green-500/15 border-green-500/30' },
  { value: 'non_veg', label: 'Non-Vegetarian', icon: '🔴', color: 'text-red-500', bgColor: 'bg-red-500/15 border-red-500/30' },
  { value: 'vegan', label: 'Vegan', icon: '🌱', color: 'text-emerald-500', bgColor: 'bg-emerald-500/15 border-emerald-500/30' },
  { value: 'egg', label: 'Contains Egg', icon: '🥚', color: 'text-amber-500', bgColor: 'bg-amber-500/15 border-amber-500/30' },
  { value: 'halal', label: 'Halal', icon: '☪️', color: 'text-teal-500', bgColor: 'bg-teal-500/15 border-teal-500/30' },
  { value: 'jain', label: 'Jain', icon: '🙏', color: 'text-orange-500', bgColor: 'bg-orange-500/15 border-orange-500/30' },
  { value: 'gluten_free', label: 'Gluten Free', icon: '🌾', color: 'text-yellow-500', bgColor: 'bg-yellow-500/15 border-yellow-500/30' },
  { value: 'dairy_free', label: 'Dairy Free', icon: '🥛', color: 'text-sky-500', bgColor: 'bg-sky-500/15 border-sky-500/30' },
  { value: 'nut_free', label: 'Nut Free', icon: '🥜', color: 'text-lime-500', bgColor: 'bg-lime-500/15 border-lime-500/30' },
  { value: 'spicy', label: 'Spicy', icon: '🌶️', color: 'text-red-600', bgColor: 'bg-red-600/15 border-red-600/30' },
  { value: 'chef_special', label: "Chef's Special", icon: '👨‍🍳', color: 'text-violet-500', bgColor: 'bg-violet-500/15 border-violet-500/30' },
  { value: 'new_item', label: 'New', icon: '✨', color: 'text-cyan-500', bgColor: 'bg-cyan-500/15 border-cyan-500/30' },
  { value: 'best_seller', label: 'Best Seller', icon: '🔥', color: 'text-orange-500', bgColor: 'bg-orange-500/15 border-orange-500/30' },
  { value: 'seasonal', label: 'Seasonal', icon: '🍂', color: 'text-amber-600', bgColor: 'bg-amber-600/15 border-amber-600/30' },
];

// -------------------------------------------------------------
// Allergen Options
// -------------------------------------------------------------
export const ALLERGEN_OPTIONS: { value: string; label: string }[] = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'dairy', label: 'Dairy / Milk' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'tree_nuts', label: 'Tree Nuts' },
  { value: 'soy', label: 'Soy' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'fish', label: 'Fish' },
  { value: 'sesame', label: 'Sesame' },
  { value: 'mustard', label: 'Mustard' },
  { value: 'celery', label: 'Celery' },
  { value: 'sulphites', label: 'Sulphites' },
];

// -------------------------------------------------------------
// Tax Categories (India-focused presets)
// -------------------------------------------------------------
export const TAX_CATEGORIES: { value: string; label: string }[] = [
  { value: 'gst_0', label: 'GST 0% (Exempt)' },
  { value: 'gst_5', label: 'GST 5%' },
  { value: 'gst_12', label: 'GST 12%' },
  { value: 'gst_18', label: 'GST 18%' },
  { value: 'gst_28', label: 'GST 28%' },
  { value: 'custom', label: 'Custom Tax' },
];

// -------------------------------------------------------------
// Spice Levels
// -------------------------------------------------------------
export const SPICE_LEVELS: { value: number; label: string; icon: string }[] = [
  { value: 0, label: 'Not Spicy', icon: '' },
  { value: 1, label: 'Mild', icon: '🌶️' },
  { value: 2, label: 'Medium', icon: '🌶️🌶️' },
  { value: 3, label: 'Hot', icon: '🌶️🌶️🌶️' },
  { value: 4, label: 'Very Hot', icon: '🌶️🌶️🌶️🌶️' },
  { value: 5, label: 'Extreme', icon: '🌶️🌶️🌶️🌶️🌶️' },
];

// -------------------------------------------------------------
// Meal Period Presets
// -------------------------------------------------------------
export const MEAL_PERIODS: { value: string; label: string; from: string; until: string }[] = [
  { value: 'breakfast', label: 'Breakfast', from: '07:00', until: '11:00' },
  { value: 'lunch', label: 'Lunch', from: '12:00', until: '15:00' },
  { value: 'dinner', label: 'Dinner', from: '19:00', until: '23:00' },
  { value: 'brunch', label: 'Brunch', from: '10:00', until: '14:00' },
  { value: 'late_night', label: 'Late Night', from: '22:00', until: '03:00' },
  { value: 'all_day', label: 'All Day', from: '', until: '' },
];

