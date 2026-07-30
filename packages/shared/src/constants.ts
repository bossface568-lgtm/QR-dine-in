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
  inactive: 'Inactive',
};

export const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
  available: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20',
  occupied: 'bg-orange-500/15 text-orange-500 border border-orange-500/20',
  reserved: 'bg-blue-500/15 text-blue-500 border border-blue-500/20',
  inactive: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
};

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
