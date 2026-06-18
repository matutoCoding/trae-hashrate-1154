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
    type: 'reset', amount: 0, balanceAfter: 800,
    description: '2026-06月度额度重置（上月剩余额度清零，不累加）',
    timestamp: new Date('2026-06-01 08:00:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a003', userId: 'u001', userName: '张三',
    type: 'consume', amount: 28, balanceAfter: 772,
    relatedOrderId: 'o001', description: '川香小厨 - 午餐',
    timestamp: new Date('2026-06-03 12:15:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a004', userId: 'u001', userName: '张三',
    type: 'consume', amount: 35.5, balanceAfter: 736.5,
    relatedOrderId: 'o002', description: '粤式茶餐厅 - 午餐（混合：餐补¥35.50 + 自费¥2.50）',
    timestamp: new Date('2026-06-05 12:30:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a005', userId: 'u001', userName: '张三',
    type: 'consume', amount: 42, balanceAfter: 694.5,
    relatedOrderId: 'o003', description: '日式拉面屋 - 晚餐',
    timestamp: new Date('2026-06-08 18:20:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a006', userId: 'u001', userName: '张三',
    type: 'consume', amount: 26, balanceAfter: 668.5,
    relatedOrderId: 'o004', description: '西北牛肉面 - 午餐',
    timestamp: new Date('2026-06-10 12:10:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a007', userId: 'u001', userName: '张三',
    type: 'consume', amount: 58, balanceAfter: 610.5,
    relatedOrderId: 'o005', description: '麻辣香锅 - 晚餐',
    timestamp: new Date('2026-06-12 18:45:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a008', userId: 'u001', userName: '张三',
    type: 'consume', amount: 42, balanceAfter: 568.5,
    relatedOrderId: 'o006', description: '港式烧腊饭 - 午餐',
    timestamp: new Date('2026-06-15 12:25:00').getTime(),
    month: '2026-06'
  },
  {
    id: 'a009', userId: 'u001', userName: '张三',
    type: 'grant', amount: 800, balanceAfter: 800,
    description: '5月餐补额度发放',
    timestamp: new Date('2026-05-01 08:00:00').getTime(),
    month: '2026-05'
  },
  {
    id: 'a010', userId: 'u001', userName: '张三',
    type: 'reset', amount: 0, balanceAfter: 800,
    description: '2026-05月度额度重置（上月剩余额度清零，不累加）',
    timestamp: new Date('2026-05-01 08:00:00').getTime(),
    month: '2026-05'
  },
  {
    id: 'a011', userId: 'u001', userName: '张三',
    type: 'consume', amount: 32, balanceAfter: 768,
    relatedOrderId: 'o007', description: '韩式拌饭 - 午餐（自费）',
    timestamp: new Date('2026-05-06 12:05:00').getTime(),
    month: '2026-05'
  },
  {
    id: 'a012', userId: 'u001', userName: '张三',
    type: 'consume', amount: 40, balanceAfter: 728,
    relatedOrderId: 'o008', description: '轻食沙拉吧 - 午餐',
    timestamp: new Date('2026-05-08 12:35:00').getTime(),
    month: '2026-05'
  },
  {
    id: 'a013', userId: 'u001', userName: '张三',
    type: 'consume', amount: 45, balanceAfter: 683,
    description: '川香小厨 - 晚餐',
    timestamp: new Date('2026-05-12 18:30:00').getTime(),
    month: '2026-05'
  },
  {
    id: 'a014', userId: 'u001', userName: '张三',
    type: 'consume', amount: 28, balanceAfter: 655,
    description: '粤式茶餐厅 - 午餐',
    timestamp: new Date('2026-05-15 12:20:00').getTime(),
    month: '2026-05'
  },
  {
    id: 'a015', userId: 'u001', userName: '张三',
    type: 'grant', amount: 100, balanceAfter: 755,
    description: '加班餐补临时发放 ¥100',
    timestamp: new Date('2026-05-20 09:00:00').getTime(),
    month: '2026-05'
  },
  {
    id: 'a016', userId: 'u001', userName: '张三',
    type: 'consume', amount: 58, balanceAfter: 697,
    description: '麻辣香锅 - 团建晚餐',
    timestamp: new Date('2026-05-22 19:10:00').getTime(),
    month: '2026-05'
  }
];
