import { insforge } from '../client';
import { Order, OrderItem, OrderStatus, OrderItemStatus, ApiResponse } from '@qrdine/types';

export const orderService = {
  async createOrder(orderData: {
    restaurant_id: string;
    table_id: string;
    customer_name: string | null;
    notes: string | null;
    total_amount: number;
    items: { menu_item_id: string; quantity: number; unit_price: number; notes: string | null }[];
  }): Promise<ApiResponse<Order & { items: OrderItem[] }>> {
    try {
      // 1. Create order
      const { data: orderRes, error: orderErr } = await insforge.database
        .from('orders')
        .insert({
          restaurant_id: orderData.restaurant_id,
          table_id: orderData.table_id,
          customer_name: orderData.customer_name,
          notes: orderData.notes,
          total_amount: orderData.total_amount,
          status: 'pending' as OrderStatus
        })
        .select();

      if (orderErr) throw orderErr;
      if (!orderRes || orderRes.length === 0) throw new Error('Order creation returned no data');

      const createdOrder = orderRes[0];

      // 2. Prepare items with the generated order_id
      const itemsToInsert = orderData.items.map(item => ({
        order_id: createdOrder.id,
        restaurant_id: orderData.restaurant_id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes,
        status: 'pending' as OrderItemStatus
      }));

      // 3. Insert items one by one or in a single call (SDK supports array inserts since it's PostgREST)
      const { data: itemsRes, error: itemsErr } = await insforge.database
        .from('order_items')
        .insert(itemsToInsert)
        .select();

      if (itemsErr) {
        // Attempt cleanup
        await insforge.database.from('orders').delete().eq('id', createdOrder.id);
        throw itemsErr;
      }

      return {
        data: {
          ...createdOrder,
          items: itemsRes || []
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to place order' } };
    }
  },

  async getOrders(restaurantId: string, status?: OrderStatus): Promise<ApiResponse<Order[]>> {
    try {
      let query = insforge.database
        .from('orders')
        .select(`
          *,
          table:tables(*),
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('restaurant_id', restaurantId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch orders' } };
    }
  },

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await insforge.database
        .from('orders')
        .select(`
          *,
          table:tables(*),
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('id', id)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch order details' } };
    }
  },

  async getOrdersByTable(tableId: string): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await insforge.database
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('table_id', tableId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch table orders' } };
    }
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await insforge.database
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update order status' } };
    }
  },

  async updateOrderItemStatus(id: string, status: OrderItemStatus): Promise<ApiResponse<OrderItem>> {
    try {
      const { data, error } = await insforge.database
        .from('order_items')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update order item status' } };
    }
  }
};
