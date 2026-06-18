// ============================================
// 美食广场订餐取餐APP - 全局类型定义
// ============================================

// 订单优先级
export type OrderPriority = 'normal' | 'urgent' | 'vip';

// 订单状态
export type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// 支付类型
export type PayType = 'subsidy' | 'selfpay' | 'mixed';

// 档口信息
export interface Stall {
  id: string;
  name: string;
  category: string;
  image: string;
}

// 插队记录（留痕）
export interface CutLineRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  reason: string;
  priority: OrderPriority;
  originalPosition: number;
  newPosition: number;
  operator: string;
  timestamp: number;
  affectedOrders: string[];
  normalAffectedOrders: string[];
}

// 排队订单
export interface QueueOrder {
  id: string;
  orderNumber: string;
  stallId: string;
  stallName: string;
  customerName: string;
  items: string[];
  itemPrices?: { name: string; price: number; quantity: number }[];
  totalAmount?: number;
  priority: OrderPriority;
  status: OrderStatus;
  queuePosition: number;
  estimatedTime: number;
  createdAt: number;
  cutLine: boolean;
  cutLineRecordId?: string;
}

// 餐补额度记录
export interface AllowanceRecord {
  id: string;
  userId: string;
  userName: string;
  type: 'grant' | 'consume' | 'reset';
  amount: number;
  balanceAfter: number;
  relatedOrderId?: string;
  description: string;
  timestamp: number;
  month: string;
}

// 用户额度信息
export interface UserAllowance {
  userId: string;
  userName: string;
  monthlyQuota: number;
  usedAmount: number;
  remainingAmount: number;
  currentMonth: string;
  lastResetTime: number;
  isSelfPayMode: boolean;
}

// 消费订单
export interface ConsumeOrder {
  id: string;
  orderNumber: string;
  stallId: string;
  stallName: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  subsidyAmount: number;
  selfpayAmount: number;
  payType: PayType;
  userId: string;
  userName: string;
  createdAt: number;
  status: OrderStatus;
}

// 档口分账记录
export interface StallSettlement {
  id: string;
  stallId: string;
  stallName: string;
  period: string;
  totalOrders: number;
  totalAmount: number;
  subsidyAmount: number;
  selfpayAmount: number;
  settledAmount: number;
  settlementDate: number;
}

// 队列统计
export interface QueueStats {
  totalActive: number;
  readyCount: number;
  preparingCount: number;
  waitingCount: number;
  vipCount: number;
  urgentCount: number;
  normalCount: number;
  todayCompleted: number;
  avgWaitTime: number;
}

// 消费统计
export interface ConsumeStats {
  todayOrders: number;
  todayAmount: number;
  monthOrders: number;
  monthAmount: number;
  subsidyTotal: number;
  selfpayTotal: number;
}
