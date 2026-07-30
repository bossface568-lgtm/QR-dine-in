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
}
export interface Role {
    id: string;
    restaurant_id: string;
    name: string;
    description: string | null;
    permissions_json: Record<string, any>;
    created_at: string;
}
export interface RestaurantUser {
    id: string;
    restaurant_id: string;
    auth_user_id: string;
    role_id: string | null;
    is_owner: boolean;
    created_at: string;
}
export interface Branch {
    id: string;
    restaurant_id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    latitude: number | null;
    longitude: number | null;
    opening_time: string | null;
    closing_time: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export type StaffRole = 'owner' | 'manager' | 'staff' | 'kitchen';
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
export interface MenuCategory {
    id: string;
    restaurant_id: string;
    name: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}
export interface MenuItem {
    id: string;
    restaurant_id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    is_veg: boolean;
    allergens: string[];
    preparation_time: number | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}
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
//# sourceMappingURL=index.d.ts.map