import { create } from 'zustand';
import type { QueueOrder, CutLineRecord, QueueStats, OrderPriority, ConsumeOrder } from '@/types';
import { mockQueueOrders, mockCutLineRecords, mockQueueStats, currentCallingNumber, stallList } from '@/data/queueData';
import { useAllowanceStore } from '@/store/allowanceStore';
import { useOrderStore } from '@/store/orderStore';

const defaultPriceMap: Record<string, number> = {
  '宫保鸡丁': 22, '麻婆豆腐': 18, '鱼香肉丝': 20, '回锅肉': 26,
  '米饭': 3, '虾饺皇': 18, '叉烧包': 12, '肠粉': 15, '皮蛋瘦肉粥': 8,
  '豚骨拉面': 32, '日式煎饺': 10, '味增汤': 6,
  '牛肉面': 24, '卤蛋': 2, '小菜': 5,
  '麻辣香锅（荤素搭配）': 58, '麻辣香锅（全素）': 38,
  '鸡胸肉沙拉': 28, '美式咖啡': 12, '鲜榨果汁': 15,
  '叉烧双拼饭': 38, '例汤': 4, '烧腊拼盘': 48,
  '牛肉石锅拌饭': 32, '泡菜': 6, '大酱汤': 12,
  'VIP特选套餐': 68, '加急商务套餐': 45
};

const estimateItemPrice = (name: string): number => {
  if (defaultPriceMap[name]) return defaultPriceMap[name];
  if (name.includes('套餐')) return 38;
  if (name.includes('面') || name.includes('饭')) return 25;
  if (name.includes('汤') || name.includes('粥')) return 10;
  if (name.includes('咖啡') || name.includes('果汁') || name.includes('茶')) return 15;
  return 20;
};

const buildItemPrices = (items: string[]): { name: string; price: number; quantity: number }[] => {
  return items.map(name => ({
    name,
    price: estimateItemPrice(name),
    quantity: 1
  }));
};

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
  advanceOrderStatus: (orderId: string) => QueueOrder | null;
  completeAndConsume: (orderId: string) => { order: QueueOrder; consumeOrder?: ConsumeOrder } | null;
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
    return get().orders.filter(o => o.status === 'waiting' || o.status === 'preparing' || o.status === 'ready');
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
      totalActive: activeOrders.length,
      readyCount: activeOrders.filter(o => o.status === 'ready').length,
      preparingCount: activeOrders.filter(o => o.status === 'preparing').length,
      waitingCount: activeOrders.filter(o => o.status === 'waiting').length,
      vipCount: activeOrders.filter(o => o.priority === 'vip').length,
      urgentCount: activeOrders.filter(o => o.priority === 'urgent').length,
      normalCount: activeOrders.filter(o => o.priority === 'normal').length,
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
    const readyOrder = sorted.find(o => o.status === 'ready');
    if (readyOrder) {
      set({ callingNumber: readyOrder.orderNumber });
      console.log('[QueueStore] callNextNumber (ready):', readyOrder.orderNumber);
      return readyOrder;
    }
    const preparingOrder = sorted.find(o => o.status === 'preparing');
    if (preparingOrder) {
      set({ callingNumber: preparingOrder.orderNumber });
      get().updateOrderStatus(preparingOrder.id, 'ready');
      console.log('[QueueStore] callNextNumber (preparing→ready):', preparingOrder.orderNumber);
      return preparingOrder;
    }
    const firstWaiting = sorted[0];
    if (firstWaiting) {
      set({ callingNumber: firstWaiting.orderNumber });
      get().updateOrderStatus(firstWaiting.id, 'preparing');
      console.log('[QueueStore] callNextNumber (waiting→preparing):', firstWaiting.orderNumber);
      return firstWaiting;
    }
    return null;
  },

  addOrder: (orderData) => {
    const orders = get().orders;
    const maxNum = orders.reduce((m, o) => {
      const n = parseInt(o.orderNumber.replace(/[A-Z]/g, ''), 10);
      return n > m ? n : m;
    }, 0);
    const itemPrices = buildItemPrices(orderData.items || []);
    const totalAmount = itemPrices.reduce((s, i) => s + i.price * i.quantity, 0);
    const newOrder: QueueOrder = {
      ...orderData,
      itemPrices,
      totalAmount,
      id: `q${Date.now()}`,
      orderNumber: `A${String(maxNum + 1).padStart(3, '0')}`,
      createdAt: Date.now(),
      queuePosition: 0,
      cutLine: false
    };
    set(state => ({ orders: [...state.orders, newOrder] }));
    get().recalcPositions();
    get().refreshStats();
    console.log('[QueueStore] addOrder:', newOrder.orderNumber, '金额:', totalAmount);
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

    const firstWaitingIdx = sorted.findIndex(o => o.status === 'waiting');
    const waitingStartIdx = firstWaitingIdx === -1 ? sorted.length : firstWaitingIdx;

    let insertIndex = sorted.length;
    for (let i = waitingStartIdx; i < sorted.length; i++) {
      const w = priorityWeight[sorted[i].priority];
      if (w > targetWeight) {
        insertIndex = i;
        break;
      }
    }

    const itemPrices = buildItemPrices(orderData.items || []);
    const totalAmount = itemPrices.reduce((s, i) => s + i.price * i.quantity, 0);
    const newOrder: QueueOrder = {
      ...orderData,
      itemPrices,
      totalAmount,
      id: `q${Date.now()}`,
      orderNumber: `A${String(maxNum + 1).padStart(3, '0')}`,
      createdAt: Date.now(),
      queuePosition: insertIndex,
      cutLine: true
    };

    const allAffected = sorted.slice(insertIndex);
    const affectedOrders = allAffected.map(o => o.orderNumber);
    const normalAffectedOrders = allAffected
      .filter(o => o.priority === 'normal' && o.status === 'waiting')
      .map(o => o.orderNumber);
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
      affectedOrders,
      normalAffectedOrders
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
      '普通单受影响:', normalAffectedOrders.length, '个', normalAffectedOrders.join('、'));
    return { order: newOrder, cutRecord };
  },

  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
    }));
    get().recalcPositions();
    get().refreshStats();
  },

  advanceOrderStatus: (orderId) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return null;
    if (order.status === 'completed' || order.status === 'cancelled') return null;

    const nextMap: Record<QueueOrder['status'], QueueOrder['status']> = {
      waiting: 'preparing',
      preparing: 'ready',
      ready: 'completed',
      completed: 'completed',
      cancelled: 'cancelled'
    };
    const nextStatus = nextMap[order.status];
    console.log('[QueueStore] advanceOrderStatus:', order.orderNumber, order.status, '→', nextStatus);

    if (nextStatus === 'completed') {
      const result = get().completeAndConsume(orderId);
      return result?.order || null;
    }

    set(state => ({
      orders: state.orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
    }));
    get().recalcPositions();
    get().refreshStats();
    return { ...order, status: nextStatus };
  },

  completeAndConsume: (orderId) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return null;
    const itemPrices = order.itemPrices || buildItemPrices(order.items || []);
    const totalAmount = order.totalAmount || itemPrices.reduce((s, i) => s + i.price * i.quantity, 0);

    useAllowanceStore.getState().checkAndResetMonthly();
    const consumeResult = useAllowanceStore.getState().consume(
      totalAmount,
      order.id,
      `${order.stallName} - ${order.orderNumber} 取餐消费`
    );

    const consumeOrderData: Omit<ConsumeOrder, 'id' | 'orderNumber' | 'createdAt'> = {
      queueOrderNumber: order.orderNumber,
      stallId: order.stallId,
      stallName: order.stallName,
      items: itemPrices,
      totalAmount,
      subsidyAmount: consumeResult.subsidyUsed,
      selfpayAmount: consumeResult.selfpayUsed,
      payType: consumeResult.payType,
      userId: 'u001',
      userName: order.customerName,
      status: 'completed'
    };
    const consumeOrder = useOrderStore.getState().addOrder(consumeOrderData);

    const allowanceRecords = useAllowanceStore.getState().records;
    const latestConsumeRecord = allowanceRecords.find(
      r => r.type === 'consume' && r.relatedOrderId === order.id
    );
    if (latestConsumeRecord && !latestConsumeRecord.relatedConsumeOrderId) {
      useAllowanceStore.setState(state => ({
        records: state.records.map(r =>
          r.id === latestConsumeRecord.id
            ? { ...r, relatedConsumeOrderId: consumeOrder.id }
            : r
        )
      }));
    }

    useOrderStore.getState().refreshSettlements();

    set(state => ({
      orders: state.orders.map(o => o.id === orderId ? {
        ...o,
        status: 'completed',
        itemPrices,
        totalAmount
      } : o)
    }));
    get().recalcPositions();
    get().refreshStats();

    console.log('[QueueStore] completeAndConsume:', order.orderNumber,
      '总金额:', totalAmount,
      '支付方式:', consumeResult.payType,
      '餐补:', consumeResult.subsidyUsed,
      '自费:', consumeResult.selfpayUsed,
      '消费订单:', consumeOrder.orderNumber);

    return {
      order: { ...order, status: 'completed', itemPrices, totalAmount },
      consumeOrder
    };
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
