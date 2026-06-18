import { create } from 'zustand';
import type { UserAllowance, AllowanceRecord, PayType } from '@/types';
import { mockUserAllowance, mockAllowanceRecords } from '@/data/allowanceData';

interface AllowanceStore {
  allowance: UserAllowance;
  records: AllowanceRecord[];
  checkAndResetMonthly: () => boolean;
  consume: (amount: number, orderId: string, description: string) => {
    success: boolean;
    payType: PayType;
    subsidyUsed: number;
    selfpayUsed: number;
    message?: string;
  };
  resetMonthly: () => void;
  grant: (amount: number, description: string) => void;
  toggleSelfPayMode: () => void;
  getRecordsByMonth: (month: string) => AllowanceRecord[];
  getMonthSummary: (month: string) => {
    month: string;
    totalGrant: number;
    totalConsume: number;
    totalReset: number;
    remaining: number;
    recordCount: number;
  };
}

const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

export const useAllowanceStore = create<AllowanceStore>((set, get) => ({
  allowance: { ...mockUserAllowance },
  records: [...mockAllowanceRecords],

  checkAndResetMonthly: () => {
    const systemMonth = getCurrentMonth();
    const { allowance } = get();
    if (allowance.currentMonth !== systemMonth) {
      console.log('[AllowanceStore] 检测到月份变化:', allowance.currentMonth, '→', systemMonth, '自动重置');
      get().resetMonthly();
      return true;
    }
    return false;
  },

  consume: (amount, orderId, description) => {
    get().checkAndResetMonthly();
    const { allowance } = get();
    const now = Date.now();
    const month = getCurrentMonth();

    if (allowance.isSelfPayMode || allowance.remainingAmount <= 0) {
      const record: AllowanceRecord = {
        id: `a${Date.now()}`,
        userId: allowance.userId,
        userName: allowance.userName,
        type: 'consume',
        amount,
        balanceAfter: allowance.remainingAmount,
        relatedOrderId: orderId,
        description: `${description}（自费）`,
        timestamp: now,
        month
      };
      set(state => ({ records: [record, ...state.records] }));
      console.log('[AllowanceStore] consume (selfpay):', amount);
      return {
        success: true,
        payType: 'selfpay',
        subsidyUsed: 0,
        selfpayUsed: amount
      };
    }

    if (allowance.remainingAmount >= amount) {
      const newBalance = allowance.remainingAmount - amount;
      const record: AllowanceRecord = {
        id: `a${Date.now()}`,
        userId: allowance.userId,
        userName: allowance.userName,
        type: 'consume',
        amount,
        balanceAfter: newBalance,
        relatedOrderId: orderId,
        description,
        timestamp: now,
        month
      };
      set(state => ({
        allowance: {
          ...state.allowance,
          usedAmount: state.allowance.usedAmount + amount,
          remainingAmount: newBalance,
          currentMonth: month
        },
        records: [record, ...state.records]
      }));
      console.log('[AllowanceStore] consume (subsidy):', amount);
      return {
        success: true,
        payType: 'subsidy',
        subsidyUsed: amount,
        selfpayUsed: 0
      };
    }

    const subsidyUsed = allowance.remainingAmount;
    const selfpayUsed = amount - subsidyUsed;
    const record: AllowanceRecord = {
      id: `a${Date.now()}`,
      userId: allowance.userId,
      userName: allowance.userName,
      type: 'consume',
      amount,
      balanceAfter: 0,
      relatedOrderId: orderId,
      description: `${description}（混合：餐补¥${subsidyUsed.toFixed(2)} + 自费¥${selfpayUsed.toFixed(2)}）`,
      timestamp: now,
      month
    };
    set(state => ({
      allowance: {
        ...state.allowance,
        usedAmount: state.allowance.monthlyQuota,
        remainingAmount: 0,
        currentMonth: month
      },
      records: [record, ...state.records]
    }));
    console.log('[AllowanceStore] consume (mixed): subsidy=', subsidyUsed, 'selfpay=', selfpayUsed);
    return {
      success: true,
      payType: 'mixed',
      subsidyUsed,
      selfpayUsed
    };
  },

  resetMonthly: () => {
    const now = Date.now();
    const month = getCurrentMonth();
    const { allowance } = get();
    const resetRecord: AllowanceRecord = {
      id: `a${Date.now()}`,
      userId: allowance.userId,
      userName: allowance.userName,
      type: 'reset',
      amount: 0,
      balanceAfter: allowance.monthlyQuota,
      description: `${month}月度额度重置（上月剩余额度清零，不累加）`,
      timestamp: now,
      month
    };
    const grantRecord: AllowanceRecord = {
      id: `a${Date.now() + 1}`,
      userId: allowance.userId,
      userName: allowance.userName,
      type: 'grant',
      amount: allowance.monthlyQuota,
      balanceAfter: allowance.monthlyQuota,
      description: `${month}餐补额度发放`,
      timestamp: now,
      month
    };
    set(state => ({
      allowance: {
        ...state.allowance,
        usedAmount: 0,
        remainingAmount: state.allowance.monthlyQuota,
        currentMonth: month,
        lastResetTime: now,
        isSelfPayMode: false
      },
      records: [grantRecord, resetRecord, ...state.records]
    }));
    console.log('[AllowanceStore] resetMonthly done, month:', month);
  },

  grant: (amount, description) => {
    get().checkAndResetMonthly();
    const now = Date.now();
    const month = getCurrentMonth();
    const { allowance } = get();
    const newBalance = allowance.remainingAmount + amount;
    const record: AllowanceRecord = {
      id: `a${Date.now()}`,
      userId: allowance.userId,
      userName: allowance.userName,
      type: 'grant',
      amount,
      balanceAfter: newBalance,
      description,
      timestamp: now,
      month
    };
    set(state => ({
      allowance: {
        ...state.allowance,
        remainingAmount: newBalance,
        monthlyQuota: state.allowance.monthlyQuota + amount,
        currentMonth: month
      },
      records: [record, ...state.records]
    }));
    console.log('[AllowanceStore] grant:', amount);
  },

  toggleSelfPayMode: () => {
    set(state => ({
      allowance: { ...state.allowance, isSelfPayMode: !state.allowance.isSelfPayMode }
    }));
  },

  getRecordsByMonth: (month) => get().records.filter(r => r.month === month),

  getMonthSummary: (month) => {
    const monthRecords = get().records.filter(r => r.month === month);
    const totalGrant = monthRecords.filter(r => r.type === 'grant').reduce((s, r) => s + r.amount, 0);
    const totalConsume = monthRecords.filter(r => r.type === 'consume').reduce((s, r) => s + r.amount, 0);
    const totalReset = monthRecords.filter(r => r.type === 'reset').reduce((s, r) => s + r.amount, 0);
    const sorted = [...monthRecords].sort((a, b) => b.timestamp - a.timestamp);
    const remaining = sorted.length > 0 ? sorted[0].balanceAfter : 0;
    return {
      month,
      totalGrant,
      totalConsume,
      totalReset,
      remaining,
      recordCount: monthRecords.length
    };
  }
}));
