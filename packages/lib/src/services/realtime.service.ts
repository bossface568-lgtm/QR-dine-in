import { insforge } from '../client';
import { Order, Table } from '@qrdine/types';

export const realtimeService = {
  // Subscribes to new/updated orders for a restaurant
  subscribeToOrders(restaurantId: string, callback: (order: Order) => void): () => void {
    const channel = `orders:${restaurantId}`;
    
    // Ensure realtime connection is active
    insforge.realtime.connect().catch(() => {});
    insforge.realtime.subscribe(channel);
    
    const handler = (message: any) => {
      // Validate channel or structure
      if (message && (message.restaurant_id === restaurantId || message.meta?.channel === channel)) {
        // If message has nested data (e.g. from pg_notify payload wrapper)
        const orderData = message.payload || message;
        callback(orderData as Order);
      }
    };

    insforge.realtime.on('order_update', handler);
    insforge.realtime.on('message', handler);
    insforge.realtime.on('broadcast', handler);

    return () => {
      insforge.realtime.off('order_update', handler);
      insforge.realtime.off('message', handler);
      insforge.realtime.off('broadcast', handler);
      insforge.realtime.unsubscribe(channel);
    };
  },

  // Subscribes to active kitchen tickets for a restaurant
  subscribeToKitchenTickets(restaurantId: string, callback: (ticket: any) => void): () => void {
    const channel = `kitchen:${restaurantId}`;

    insforge.realtime.connect().catch(() => {});
    insforge.realtime.subscribe(channel);

    const handler = (message: any) => {
      if (message && (message.restaurant_id === restaurantId || message.meta?.channel === channel)) {
        const ticketData = message.payload || message;
        callback(ticketData);
      }
    };

    insforge.realtime.on('new_ticket', handler);
    insforge.realtime.on('message', handler);
    insforge.realtime.on('broadcast', handler);

    return () => {
      insforge.realtime.off('new_ticket', handler);
      insforge.realtime.off('message', handler);
      insforge.realtime.off('broadcast', handler);
      insforge.realtime.unsubscribe(channel);
    };
  },

  // Subscribes to table status changes for a restaurant
  subscribeToTableStatus(restaurantId: string, callback: (table: Table) => void): () => void {
    const channel = `tables:${restaurantId}`;

    insforge.realtime.connect().catch(() => {});
    insforge.realtime.subscribe(channel);

    const handler = (message: any) => {
      if (message && (message.restaurant_id === restaurantId || message.meta?.channel === channel)) {
        const tableData = message.payload || message;
        callback(tableData as Table);
      }
    };

    insforge.realtime.on('table_status_update', handler);
    insforge.realtime.on('message', handler);
    insforge.realtime.on('broadcast', handler);

    return () => {
      insforge.realtime.off('table_status_update', handler);
      insforge.realtime.off('message', handler);
      insforge.realtime.off('broadcast', handler);
      insforge.realtime.unsubscribe(channel);
    };
  },

  // Subscribes to a single order's status changes for the customer tracking view
  subscribeToOrderStatus(orderId: string, callback: (status: string) => void): () => void {
    const channel = `order:${orderId}`;

    insforge.realtime.connect().catch(() => {});
    insforge.realtime.subscribe(channel);

    const handler = (message: any) => {
      // Check if it is the target order status update
      const msg = message.payload || message;
      if (msg && (msg.order_id === orderId || msg.id === orderId)) {
        callback(msg.status);
      }
    };

    insforge.realtime.on('order_status_update', handler);
    insforge.realtime.on('message', handler);
    insforge.realtime.on('broadcast', handler);

    return () => {
      insforge.realtime.off('order_status_update', handler);
      insforge.realtime.off('message', handler);
      insforge.realtime.off('broadcast', handler);
      insforge.realtime.unsubscribe(channel);
    };
  }
};
