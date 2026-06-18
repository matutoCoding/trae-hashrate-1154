import type { ConsumeOrder, ConsumeStats, StallSettlement, PayType } from '@/types';
import { useOrderStore } from '@/store/orderStore';
import { allowanceService } from './allowanceService';

export const orderService = {
  getOrders: (): ConsumeOrder[] => {
    return useOrderStore.getState().orders;
  },

  getOrderById: (id: string): ConsumeOrder | undefined => {
    return useOrderStore.getState().getOrderById(id);
  },

  getStats: (): ConsumeStats => {
    return useOrderStore.getState().stats;
  },

  getSettlements: (): StallSettlement[] => {
    return useOrderStore.getState().settlements;
  },

  getTodayOrders: (): ConsumeOrder[] => {
    return useOrderStore.getState().getTodayOrders();
  },

  getMonthOrders: (): ConsumeOrder[] => {
    return useOrderStore.getState().getMonthOrders();
  },

  getOrdersByStall: (stallId: string): ConsumeOrder[] => {
    return useOrderStore.getState().getOrdersByStall(stallId);
  },

  createOrder: (
    stallId: string,
    stallName: string,
    items: { name: string; price: number; quantity: number }[],
    userId: string,
    userName: string
  ): ConsumeOrder => {
    const totalAmount = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const consumeResult = allowanceService.consume(totalAmount, '', `${stallName}消费`);

    const order: ConsumeOrder = {
      stallId,
      stallName,
      items,
      totalAmount,
      subsidyAmount: consumeResult.subsidyUsed,
      selfpayAmount: consumeResult.selfpayUsed,
      payType: consumeResult.payType,
      userId,
      userName,
      status: 'completed'
    };

    const savedOrder = useOrderStore.getState().addOrder(order);

    if (consumeResult.subsidyUsed > 0) {
      console.log('[OrderService] order created with subsidy:', savedOrder.id);
    }

    return savedOrder;
  },

  getPayTypeLabel: (payType: PayType): string => {
    const map: Record<PayType, string> = {
      subsidy: '餐补',
      selfpay: '自费',
      mixed: '混合支付'
    };
    return map[payType];
  },

  getStallTotal: (stallId: string): { orders: number; amount: number; subsidy: number; selfpay: number } => {
    const orders = useOrderStore.getState().getOrdersByStall(stallId);
    return {
      orders: orders.length,
      amount: orders.reduce((s, o) => s + o.totalAmount, 0),
      subsidy: orders.reduce((s, o) => s + o.subsidyAmount, 0),
      selfpay: orders.reduce((s, o) => s + o.selfpayAmount, 0)
    };
  }
};
