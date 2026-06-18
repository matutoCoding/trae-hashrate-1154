import { create } from 'zustand';
import type { ConsumeOrder, ConsumeStats, StallSettlement } from '@/types';
import { mockConsumeOrders, mockConsumeStats, mockStallSettlements } from '@/data/orderData';

interface OrderStore {
  orders: ConsumeOrder[];
  stats: ConsumeStats;
  settlements: StallSettlement[];
  getOrderById: (id: string) => ConsumeOrder | undefined;
  getOrdersByStall: (stallId: string) => ConsumeOrder[];
  getTodayOrders: () => ConsumeOrder[];
  getMonthOrders: () => ConsumeOrder[];
  addOrder: (order: Omit<ConsumeOrder, 'id' | 'orderNumber' | 'createdAt'>) => ConsumeOrder;
  refreshStats: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [...mockConsumeOrders],
  stats: { ...mockConsumeStats },
  settlements: [...mockStallSettlements],

  getOrderById: (id) => get().orders.find(o => o.id === id),

  getOrdersByStall: (stallId) => get().orders.filter(o => o.stallId === stallId),

  getTodayOrders: () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return get().orders.filter(o => o.createdAt >= start);
  },

  getMonthOrders: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return get().orders.filter(o => o.createdAt >= start);
  },

  addOrder: (orderData) => {
    const now = Date.now();
    const dateStr = new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
    const maxSeq = get().orders.reduce((m, o) => {
      const suffix = o.orderNumber.slice(-4);
      const n = parseInt(suffix, 10);
      return n > m ? n : m;
    }, 0);
    const newOrder: ConsumeOrder = {
      ...orderData,
      id: `o${now}`,
      orderNumber: `O${dateStr}${String(maxSeq + 1).padStart(4, '0')}`,
      createdAt: now
    };
    set(state => ({ orders: [newOrder, ...state.orders] }));
    get().refreshStats();
    console.log('[OrderStore] addOrder:', newOrder.orderNumber);
    return newOrder;
  },

  refreshStats: () => {
    const orders = get().orders;
    const todayOrders = get().getTodayOrders();
    const monthOrders = get().getMonthOrders();

    const stats: ConsumeStats = {
      todayOrders: todayOrders.length,
      todayAmount: todayOrders.reduce((s, o) => s + o.totalAmount, 0),
      monthOrders: monthOrders.length,
      monthAmount: monthOrders.reduce((s, o) => s + o.totalAmount, 0),
      subsidyTotal: monthOrders.reduce((s, o) => s + o.subsidyAmount, 0),
      selfpayTotal: monthOrders.reduce((s, o) => s + o.selfpayAmount, 0)
    };
    set({ stats });
  }
}));
