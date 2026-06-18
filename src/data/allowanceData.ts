import type { UserAllowance, AllowanceRecord } from '@/types';

export const mockUserAllowance: UserAllowance = {
  userId: 'u001',
  userName: '张三',
  monthlyQuota: 800,
  usedAmount: 568.5,
  remainingAmount: 231.5,
  currentMonth: '2026-06',
  lastResetTime: new Date('2026-06-01').getTime(),
  isSelfPayMode: false
};

export const mockAllowanceRecords: AllowanceRecord[] = [
  {
    id: 'a001', userId: 'u001', userName: '张三',
    type: 'grant', amount: 800, balanceAfter: 800,
    description: '6月餐补额度发放',
    timestamp: new Date('2026-06-01 08:00:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a002', userId: 'u001', userName: '张三',
    type: 'consume', amount: 28, balanceAfter: 772,
    relatedOrderId: 'o001', description: '川香小厨 - 午餐',
    timestamp: new Date('2026-06-03 12:15:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a003', userId: 'u001', userName: '张三',
    type: 'consume', amount: 35.5, balanceAfter: 736.5,
    relatedOrderId: 'o002', description: '粤式茶餐厅 - 午餐',
    timestamp: new Date('2026-06-05 12:30:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a004', userId: 'u001', userName: '张三',
    type: 'consume', amount: 42, balanceAfter: 694.5,
    relatedOrderId: 'o003', description: '日式拉面屋 - 晚餐',
    timestamp: new Date('2026-06-08 18:20:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a005', userId: 'u001', userName: '张三',
    type: 'consume', amount: 26, balanceAfter: 668.5,
    relatedOrderId: 'o004', description: '西北牛肉面 - 午餐',
    timestamp: new Date('2026-06-10 12:10:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a006', userId: 'u001', userName: '张三',
    type: 'consume', amount: 58, balanceAfter: 610.5,
    relatedOrderId: 'o005', description: '麻辣香锅 - 晚餐',
    timestamp: new Date('2026-06-12 18:45:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a007', userId: 'u001', userName: '张三',
    type: 'consume', amount: 42, balanceAfter: 568.5,
    relatedOrderId: 'o006', description: '港式烧腊饭 - 午餐',
    timestamp: new Date('2026-06-15 12:25:00').getTime(),
    month: '2026-06'
  }
];
