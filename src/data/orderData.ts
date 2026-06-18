import type { ConsumeOrder, ConsumeStats, StallSettlement } from '@/types';

export const mockConsumeOrders: ConsumeOrder[] = [
  {
    id: 'o001', orderNumber: 'O202606180001', stallId: 's001', stallName: '川香小厨',
    items: [
      { name: '宫保鸡丁', price: 22, quantity: 1 },
      { name: '米饭', price: 3, quantity: 2 }
    ],
    totalAmount: 28, subsidyAmount: 28, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-18 12:15:00').getTime(), status: 'completed'
  },
  {
    id: 'o002', orderNumber: 'O202606180002', stallId: 's002', stallName: '粤式茶餐厅',
    items: [
      { name: '虾饺皇', price: 18, quantity: 1 },
      { name: '叉烧包', price: 12, quantity: 1 },
      { name: '皮蛋瘦肉粥', price: 8, quantity: 1 }
    ],
    totalAmount: 38, subsidyAmount: 35.5, selfpayAmount: 2.5, payType: 'mixed',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-18 12:30:00').getTime(), status: 'completed'
  },
  {
    id: 'o003', orderNumber: 'O202606170001', stallId: 's003', stallName: '日式拉面屋',
    items: [
      { name: '豚骨拉面', price: 32, quantity: 1 },
      { name: '日式煎饺', price: 10, quantity: 1 }
    ],
    totalAmount: 42, subsidyAmount: 42, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-17 18:20:00').getTime(), status: 'completed'
  },
  {
    id: 'o004', orderNumber: 'O202606160001', stallId: 's004', stallName: '西北牛肉面',
    items: [
      { name: '招牌牛肉面', price: 24, quantity: 1 },
      { name: '卤蛋', price: 2, quantity: 1 }
    ],
    totalAmount: 26, subsidyAmount: 26, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-16 12:10:00').getTime(), status: 'completed'
  },
  {
    id: 'o005', orderNumber: 'O202606150001', stallId: 's005', stallName: '麻辣香锅',
    items: [
      { name: '麻辣香锅（荤素搭配）', price: 58, quantity: 1 }
    ],
    totalAmount: 58, subsidyAmount: 58, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-15 18:45:00').getTime(), status: 'completed'
  },
  {
    id: 'o006', orderNumber: 'O202606140001', stallId: 's007', stallName: '港式烧腊饭',
    items: [
      { name: '叉烧双拼饭', price: 38, quantity: 1 },
      { name: '例汤', price: 4, quantity: 1 }
    ],
    totalAmount: 42, subsidyAmount: 42, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-14 12:25:00').getTime(), status: 'completed'
  },
  {
    id: 'o007', orderNumber: 'O202606130001', stallId: 's008', stallName: '韩式拌饭',
    items: [
      { name: '牛肉石锅拌饭', price: 32, quantity: 1 }
    ],
    totalAmount: 32, subsidyAmount: 0, selfpayAmount: 32, payType: 'selfpay',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-13 12:05:00').getTime(), status: 'completed'
  },
  {
    id: 'o008', orderNumber: 'O202606120001', stallId: 's006', stallName: '轻食沙拉吧',
    items: [
      { name: '鸡胸肉蔬菜沙拉', price: 28, quantity: 1 },
      { name: '美式咖啡', price: 12, quantity: 1 }
    ],
    totalAmount: 40, subsidyAmount: 40, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-12 12:35:00').getTime(), status: 'completed'
  }
];

export const mockConsumeStats: ConsumeStats = {
  todayOrders: 2,
  todayAmount: 66,
  monthOrders: 15,
  monthAmount: 568.5,
  subsidyTotal: 536.5,
  selfpayTotal: 32
};

export const mockStallSettlements: StallSettlement[] = [
  {
    id: 'st001', stallId: 's001', stallName: '川香小厨',
    period: '2026-06', totalOrders: 156, totalAmount: 4680,
    subsidyAmount: 4200, selfpayAmount: 480, settledAmount: 4680,
    settlementDate: new Date('2026-06-15').getTime()
  },
  {
    id: 'st002', stallId: 's002', stallName: '粤式茶餐厅',
    period: '2026-06', totalOrders: 132, totalAmount: 5280,
    subsidyAmount: 4900, selfpayAmount: 380, settledAmount: 5280,
    settlementDate: new Date('2026-06-15').getTime()
  },
  {
    id: 'st003', stallId: 's003', stallName: '日式拉面屋',
    period: '2026-06', totalOrders: 128, totalAmount: 4096,
    subsidyAmount: 3800, selfpayAmount: 296, settledAmount: 4096,
    settlementDate: new Date('2026-06-15').getTime()
  },
  {
    id: 'st004', stallId: 's004', stallName: '西北牛肉面',
    period: '2026-06', totalOrders: 189, totalAmount: 4536,
    subsidyAmount: 4200, selfpayAmount: 336, settledAmount: 4536,
    settlementDate: new Date('2026-06-15').getTime()
  },
  {
    id: 'st005', stallId: 's005', stallName: '麻辣香锅',
    period: '2026-06', totalOrders: 98, totalAmount: 5684,
    subsidyAmount: 5100, selfpayAmount: 584, settledAmount: 5684,
    settlementDate: new Date('2026-06-15').getTime()
  }
];
