import type { QueueOrder, OrderPriority, CutLineRecord } from '@/types';
import { useQueueStore } from '@/store/queueStore';

export const queueService = {
  getQueueList: (): QueueOrder[] => {
    return useQueueStore.getState().getSortedOrders();
  },

  getStats: () => {
    return useQueueStore.getState().stats;
  },

  getCallingNumber: (): string => {
    return useQueueStore.getState().callingNumber;
  },

  callNext: (): QueueOrder | null => {
    return useQueueStore.getState().callNextNumber();
  },

  takeNumber: (
    stallId: string,
    stallName: string,
    customerName: string,
    items: string[]
  ): QueueOrder => {
    return useQueueStore.getState().addOrder({
      stallId,
      stallName,
      customerName,
      items,
      priority: 'normal',
      status: 'waiting',
      estimatedTime: 15
    });
  },

  insertVIPOrder: (
    stallId: string,
    stallName: string,
    customerName: string,
    items: string[],
    reason: string
  ): { order: QueueOrder; cutRecord: CutLineRecord } => {
    return useQueueStore.getState().insertPriorityOrder(
      {
        stallId,
        stallName,
        customerName,
        items,
        priority: 'vip',
        status: 'waiting',
        estimatedTime: 5
      },
      reason,
      'VIP系统'
    );
  },

  insertUrgentOrder: (
    stallId: string,
    stallName: string,
    customerName: string,
    items: string[],
    reason: string,
    operator: string
  ): { order: QueueOrder; cutRecord: CutLineRecord } => {
    return useQueueStore.getState().insertPriorityOrder(
      {
        stallId,
        stallName,
        customerName,
        items,
        priority: 'urgent',
        status: 'waiting',
        estimatedTime: 8
      },
      reason,
      operator
    );
  },

  updateStatus: (orderId: string, status: QueueOrder['status']): void => {
    useQueueStore.getState().updateOrderStatus(orderId, status);
  },

  advanceStatus: (orderId: string): QueueOrder | null => {
    return useQueueStore.getState().advanceOrderStatus(orderId);
  },

  completeAndConsume: (orderId: string) => {
    return useQueueStore.getState().completeAndConsume(orderId);
  },

  getCutLineRecords: (): CutLineRecord[] => {
    return useQueueStore.getState().cutLineRecords;
  },

  getPriorityLabel: (priority: OrderPriority): string => {
    const map: Record<OrderPriority, string> = {
      normal: '普通',
      urgent: '加急',
      vip: 'VIP'
    };
    return map[priority];
  },

  getStatusLabel: (status: QueueOrder['status']): string => {
    const map: Record<QueueOrder['status'], string> = {
      waiting: '等待中',
      preparing: '制作中',
      ready: '待取餐',
      completed: '已完成',
      cancelled: '已取消'
    };
    return map[status];
  },

  getNextStatusLabel: (status: QueueOrder['status']): string => {
    const map: Record<QueueOrder['status'], string> = {
      waiting: '开始制作',
      preparing: '制作完成',
      ready: '确认取餐',
      completed: '已完成',
      cancelled: '已取消'
    };
    return map[status];
  }
};
