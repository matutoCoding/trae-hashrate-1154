import { create } from 'zustand';
import type { UserAllowance, AllowanceRecord, PayType } from '@/types';
import { mockUserAllowance, mockAllowanceRecords } from '@/data/allowanceData';

interface AllowanceStore {
  allowance: UserAllowance;
  records: AllowanceRecord[];
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
}

export const useAllowanceStore = create<AllowanceStore>((set, get) => ({
  allowance: { ...mockUserAllowance },
  records: [...mockAllowanceRecords],

  consume: (amount, orderId, description) => {
    const { allowance } = get();
    const now = Date.now();
    const month = new Date().toISOString().slice(0, 7);

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
          remainingAmount: newBalance
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
      description: `${description}（混合：餐补${subsidyUsed} + 自费${selfpayUsed}）`,
      timestamp: now,
      month
    };
    set(state => ({
      allowance: {
        ...state.allowance,
        usedAmount: state.allowance.monthlyQuota,
        remainingAmount: 0
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
    const month = new Date().toISOString().slice(0, 7);
    const { allowance } = get();
    const record: AllowanceRecord = {
      id: `a${Date.now()}`,
      userId: allowance.userId,
      userName: allowance.userName,
      type: 'reset',
      amount: 0,
      balanceAfter: allowance.monthlyQuota,
      description: `${month}月度额度重置（上月剩余额度清零）`,
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
      records: [grantRecord, record, ...state.records]
    }));
    console.log('[AllowanceStore] resetMonthly done');
  },

  grant: (amount, description) => {
    const now = Date.now();
    const month = new Date().toISOString().slice(0, 7);
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
        monthlyQuota: state.allowance.monthlyQuota + amount
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

  getRecordsByMonth: (month) => get().records.filter(r => r.month === month)
}));
