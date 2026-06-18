import type { UserAllowance, AllowanceRecord } from '@/types';
import { useAllowanceStore } from '@/store/allowanceStore';

export const allowanceService = {
  getAllowance: (): UserAllowance => {
    return useAllowanceStore.getState().allowance;
  },

  getRecords: (): AllowanceRecord[] => {
    return useAllowanceStore.getState().records;
  },

  getRecordsByMonth: (month: string): AllowanceRecord[] => {
    return useAllowanceStore.getState().getRecordsByMonth(month);
  },

  consume: (amount: number, orderId: string, description: string) => {
    return useAllowanceStore.getState().consume(amount, orderId, description);
  },

  resetMonthly: (): void => {
    useAllowanceStore.getState().resetMonthly();
  },

  grant: (amount: number, description: string): void => {
    useAllowanceStore.getState().grant(amount, description);
  },

  toggleSelfPayMode: (): void => {
    useAllowanceStore.getState().toggleSelfPayMode();
  },

  getUsagePercent: (): number => {
    const { allowance } = useAllowanceStore.getState();
    if (allowance.monthlyQuota <= 0) return 0;
    return Math.min(100, Math.round((allowance.usedAmount / allowance.monthlyQuota) * 100));
  },

  canUseSubsidy: (): boolean => {
    const { allowance } = useAllowanceStore.getState();
    return !allowance.isSelfPayMode && allowance.remainingAmount > 0;
  },

  getRecordTypeLabel: (type: AllowanceRecord['type']): string => {
    const map: Record<AllowanceRecord['type'], string> = {
      grant: '发放',
      consume: '消费',
      reset: '重置'
    };
    return map[type];
  },

  getDaysUntilReset: (): number => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diff = nextMonth.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
};
