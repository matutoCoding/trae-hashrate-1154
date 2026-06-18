import { create } from 'zustand';
import type { QueueOrder, CutLineRecord, QueueStats, OrderPriority } from '@/types';
import { mockQueueOrders, mockCutLineRecords, mockQueueStats, currentCallingNumber, stallList } from '@/data/queueData';

interface QueueStore {
  orders: QueueOrder[];
  cutLineRecords: CutLineRecord[];
  stats: QueueStats;
  callingNumber: string;
  getSortedOrders: () => QueueOrder[];
  getActiveOrders: () => QueueOrder[];
  refreshStats: () => void;
  callNextNumber: () => QueueOrder | null;
  addOrder: (order: Omit<QueueOrder, 'id' | 'orderNumber' | 'createdAt' | 'queuePosition'>) => QueueOrder;
  insertPriorityOrder: (
    order: Omit<QueueOrder, 'id' | 'orderNumber' | 'createdAt' | 'queuePosition' | 'cutLine'>,
    reason: string,
    operator: string
  ) => { order: QueueOrder; cutRecord: CutLineRecord };
  updateOrderStatus: (orderId: string, status: QueueOrder['status']) => void;
  recalcPositions: () => void;
}

export const useQueueStore = create<QueueStore>((set, get) => ({
  orders: [...mockQueueOrders],
  cutLineRecords: [...mockCutLineRecords],
  stats: { ...mockQueueStats },
  callingNumber,

  getSortedOrders: () => {
    const priorityWeight: Record<OrderPriority, number> = { vip: 0, urgent: 1, normal: 2 };
    return [...get().orders]
      .filter(o => o.status === 'waiting' || o.status === 'preparing' || o.status === 'ready')
      .sort((a, b) => {
        if (a.status === 'ready' && b.status !== 'ready') return -1;
        if (b.status === 'ready' && a.status !== 'ready') return 1;
        if (a.status === 'preparing' && b.status !== 'preparing') return -1;
        if (b.status === 'preparing' && a.status !== 'preparing') return 1;
        const pw = priorityWeight[a.priority] - priorityWeight[b.priority];
        if (pw !== 0) return pw;
        return a.createdAt - b.createdAt;
      });
  },

  getActiveOrders: () => {
    return get().orders.filter(o => o.status === 'waiting' || o.status === 'preparing');
  },

  refreshStats: () => {
    const activeOrders = get().getActiveOrders();
    const completedToday = get().orders.filter(o => {
      if (o.status !== 'completed') return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return o.createdAt >= today.getTime();
    }).length;

    const stats: QueueStats = {
      totalWaiting: activeOrders.length,
      vipWaiting: activeOrders.filter(o => o.priority === 'vip').length,
      urgentWaiting: activeOrders.filter(o => o.priority === 'urgent').length,
      normalWaiting: activeOrders.filter(o => o.priority === 'normal').length,
      todayCompleted: completedToday > 0 ? completedToday : get().stats.todayCompleted,
      avgWaitTime: activeOrders.length > 0
        ? Math.round(activeOrders.reduce((s, o) => s + (o.estimatedTime || 10), 0) / activeOrders.length)
        : 0
    };
    set({ stats });
    console.log('[QueueStore] refreshStats:', JSON.stringify(stats));
  },

  callNextNumber: () => {
    const sorted = get().getSortedOrders();
    const next = sorted.find(o => o.status === 'ready') || sorted.find(o => o.status === 'preparing') || sorted[0];
    if (next) {
      set({ callingNumber: next.orderNumber });
      get().updateOrderStatus(next.id, 'completed');
      console.log('[QueueStore] callNextNumber called:', next.orderNumber);
      return next;
    }
    return null;
  },

  addOrder: (orderData) => {
    const orders = get().orders;
    const maxNum = orders.reduce((m, o) => {
      const n = parseInt(o.orderNumber.replace(/[A-Z]/g, ''), 10);
      return n > m ? n : m;
    }, 0);
    const newOrder: QueueOrder = {
      ...orderData,
      id: `q${Date.now()}`,
      orderNumber: `A${String(maxNum + 1).padStart(3, '0')}`,
      createdAt: Date.now(),
      queuePosition: 0,
      cutLine: false
    };
    set(state => ({ orders: [...state.orders, newOrder] }));
    get().recalcPositions();
    get().refreshStats();
    console.log('[QueueStore] addOrder:', newOrder.orderNumber);
    return newOrder;
  },

  insertPriorityOrder: (orderData, reason, operator) => {
    const orders = get().orders;
    const maxNum = orders.reduce((m, o) => {
      const n = parseInt(o.orderNumber.replace(/[A-Z]/g, ''), 10);
      return n > m ? n : m;
    }, 0);
    const priorityWeight: Record<OrderPriority, number> = { vip: 0, urgent: 1, normal: 2 };
    const targetWeight = priorityWeight[orderData.priority];

    const sorted = get().getSortedOrders();
    let insertIndex = sorted.length;
    for (let i = 0; i < sorted.length; i++) {
      const w = priorityWeight[sorted[i].priority];
      if (w > targetWeight) {
        insertIndex = i;
        break;
      }
    }

    const newOrder: QueueOrder = {
      ...orderData,
      id: `q${Date.now()}`,
      orderNumber: `A${String(maxNum + 1).padStart(3, '0')}`,
      createdAt: Date.now(),
      queuePosition: insertIndex,
      cutLine: true
    };

    const affectedOrders = sorted.slice(insertIndex).map(o => o.orderNumber);
    const originalPositionUser = sorted.length + 1;
    const newPositionUser = insertIndex + 1;

    const cutRecord: CutLineRecord = {
      id: `c${Date.now()}`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      reason,
      priority: orderData.priority,
      originalPosition: originalPositionUser,
      newPosition: newPositionUser,
      operator,
      timestamp: Date.now(),
      affectedOrders
    };
    newOrder.cutLineRecordId = cutRecord.id;

    const newOrdersList = [...orders, newOrder];
    set(state => ({
      orders: newOrdersList,
      cutLineRecords: [cutRecord, ...state.cutLineRecords]
    }));
    get().recalcPositions();
    get().refreshStats();
    console.log('[QueueStore] insertPriorityOrder:', newOrder.orderNumber,
      '原位置:', originalPositionUser, '→ 新位置:', newPositionUser,
      '受影响订单:', affectedOrders.length, '个');
    return { order: newOrder, cutRecord };
  },

  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
    }));
    get().refreshStats();
  },

  recalcPositions: () => {
    const sorted = get().getSortedOrders();
    set(state => ({
      orders: state.orders.map(o => {
        const idx = sorted.findIndex(s => s.id === o.id);
        return idx >= 0 ? { ...o, queuePosition: idx } : o;
      })
    }));
  }
}));

export { stallList };
