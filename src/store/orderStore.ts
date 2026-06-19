import { create } from 'zustand';
import type { ConsumeOrder, ConsumeStats, StallSettlement } from '@/types';
import { mockConsumeOrders, mockConsumeStats, mockStallSettlements } from '@/data/orderData';

interface OrderStore {
  orders: ConsumeOrder[];
  stats: ConsumeStats;
  settlements: StallSettlement[];
  getOrderById: (id: string) => ConsumeOrder | undefined;
  getOrdersByStall: (stallId: string) => ConsumeOrder[];
  getOrdersByMonth: (month: string) => ConsumeOrder[];
  getTodayOrders: () => ConsumeOrder[];
  getMonthOrders: () => ConsumeOrder[];
  addOrder: (order: Omit<ConsumeOrder, 'id' | 'orderNumber' | 'createdAt' | 'source'> & { source?: ConsumeOrder['source'] }) => ConsumeOrder;
  refreshStats: () => void;
  refreshSettlements: (month?: string) => void;
}

const getCurrentPeriod = (): string => {
  return new Date().toISOString().slice(0, 7);
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [...mockConsumeOrders],
  stats: { ...mockConsumeStats },
  settlements: [...mockStallSettlements],

  getOrderById: (id) => get().orders.find(o => o.id === id),

  getOrdersByStall: (stallId) => get().orders.filter(o => o.stallId === stallId),

  getOrdersByMonth: (month) => {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, m - 1, 1).getTime();
    const end = new Date(y, m, 1).getTime();
    return get().orders.filter(o => o.createdAt >= start && o.createdAt < end);
  },

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
      source: orderData.source || 'queue',
      id: `o${now}`,
      orderNumber: `O${dateStr}${String(maxSeq + 1).padStart(4, '0')}`,
      createdAt: now
    };
    set(state => ({ orders: [newOrder, ...state.orders] }));
    get().refreshStats();
    get().refreshSettlements();
    console.log('[OrderStore] addOrder:', newOrder.orderNumber,
      orderData.queueOrderNumber ? `(来源: 排队号${orderData.queueOrderNumber})` : '');
    return newOrder;
  },

  refreshStats: () => {
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
  },

  refreshSettlements: (month) => {
    const period = month || getCurrentPeriod();
    const monthOrders = get().getOrdersByMonth(period);
    const stallMap = new Map<string, {
      stallId: string;
      stallName: string;
      totalOrders: number;
      totalAmount: number;
      subsidyAmount: number;
      selfpayAmount: number;
    }>();

    for (const order of monthOrders) {
      const existing = stallMap.get(order.stallId);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalAmount += order.totalAmount;
        existing.subsidyAmount += order.subsidyAmount;
        existing.selfpayAmount += order.selfpayAmount;
      } else {
        stallMap.set(order.stallId, {
          stallId: order.stallId,
          stallName: order.stallName,
          totalOrders: 1,
          totalAmount: order.totalAmount,
          subsidyAmount: order.subsidyAmount,
          selfpayAmount: order.selfpayAmount
        });
      }
    }

    const settlements: StallSettlement[] = Array.from(stallMap.values()).map((data, idx) => ({
      id: `st_${data.stallId}_${period}`,
      stallId: data.stallId,
      stallName: data.stallName,
      period,
      totalOrders: data.totalOrders,
      totalAmount: Math.round(data.totalAmount * 100) / 100,
      subsidyAmount: Math.round(data.subsidyAmount * 100) / 100,
      selfpayAmount: Math.round(data.selfpayAmount * 100) / 100,
      settledAmount: Math.round(data.totalAmount * 100) / 100,
      settlementDate: Date.now()
    }));

    set({ settlements });
    console.log('[OrderStore] refreshSettlements:', settlements.length, '个档口已更新');
  }
}));
