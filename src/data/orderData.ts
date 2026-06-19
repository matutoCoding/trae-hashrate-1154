import type { ConsumeOrder, ConsumeStats, StallSettlement } from '@/types';

export const mockConsumeOrders: ConsumeOrder[] = [
  {
    id: 'o001', orderNumber: 'O202606180001', stallId: 's001', stallName: '川香小厨',
    source: 'queue', queueOrderNumber: 'A001',
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
    source: 'queue', queueOrderNumber: 'A004',
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
    source: 'direct',
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
    source: 'queue', queueOrderNumber: 'A005',
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
    source: 'direct',
    items: [
      { name: '麻辣香锅（荤素搭配）', price: 58, quantity: 1 }
    ],
    totalAmount: 58, subsidyAmount: 58, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-15 18:45:00').getTime(), status: 'completed'
  },
  {
    id: 'o006', orderNumber: 'O202606140001', stallId: 's007', stallName: '港式烧腊饭',
    source: 'queue', queueOrderNumber: 'A007',
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
    source: 'direct',
    items: [
      { name: '牛肉石锅拌饭', price: 32, quantity: 1 }
    ],
    totalAmount: 32, subsidyAmount: 0, selfpayAmount: 32, payType: 'selfpay',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-13 12:05:00').getTime(), status: 'completed'
  },
  {
    id: 'o008', orderNumber: 'O202606120001', stallId: 's006', stallName: '轻食沙拉吧',
    source: 'queue', queueOrderNumber: 'A008',
    items: [
      { name: '鸡胸肉蔬菜沙拉', price: 28, quantity: 1 },
      { name: '美式咖啡', price: 12, quantity: 1 }
    ],
    totalAmount: 40, subsidyAmount: 40, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-12 12:35:00').getTime(), status: 'completed'
  },
  {
    id: 'o009', orderNumber: 'O202605220001', stallId: 's005', stallName: '麻辣香锅',
    source: 'direct',
    items: [
      { name: '麻辣香锅（荤素搭配）', price: 58, quantity: 1 }
    ],
    totalAmount: 58, subsidyAmount: 58, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-05-22 19:10:00').getTime(), status: 'completed'
  },
  {
    id: 'o010', orderNumber: 'O202605150001', stallId: 's002', stallName: '粤式茶餐厅',
    source: 'queue', queueOrderNumber: 'A051',
    items: [
      { name: '肠粉', price: 15, quantity: 1 },
      { name: '皮蛋瘦肉粥', price: 8, quantity: 1 },
      { name: '叉烧包', price: 12, quantity: 1 }
    ],
    totalAmount: 35, subsidyAmount: 35, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-05-15 12:20:00').getTime(), status: 'completed'
  },
  {
    id: 'o011', orderNumber: 'O202605120001', stallId: 's001', stallName: '川香小厨',
    source: 'queue', queueOrderNumber: 'A043',
    items: [
      { name: '回锅肉', price: 26, quantity: 1 },
      { name: '鱼香肉丝', price: 20, quantity: 1 }
    ],
    totalAmount: 46, subsidyAmount: 46, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-05-12 18:30:00').getTime(), status: 'completed'
  },
  {
    id: 'o012', orderNumber: 'O202605080001', stallId: 's006', stallName: '轻食沙拉吧',
    source: 'direct',
    items: [
      { name: '鸡胸肉蔬菜沙拉', price: 28, quantity: 1 },
      { name: '美式咖啡', price: 12, quantity: 1 }
    ],
    totalAmount: 40, subsidyAmount: 40, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-05-08 12:35:00').getTime(), status: 'completed'
  },
  {
    id: 'o013', orderNumber: 'O202605060001', stallId: 's008', stallName: '韩式拌饭',
    source: 'imported',
    items: [
      { name: '牛肉石锅拌饭', price: 32, quantity: 1 }
    ],
    totalAmount: 32, subsidyAmount: 0, selfpayAmount: 32, payType: 'selfpay',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-05-06 12:05:00').getTime(), status: 'completed'
  },
  {
    id: 'o014', orderNumber: 'O202606190001', stallId: 's001', stallName: '川香小厨',
    source: 'queue', queueOrderNumber: 'A009',
    items: [
      { name: '麻婆豆腐', price: 18, quantity: 1 },
      { name: '米饭', price: 3, quantity: 1 }
    ],
    totalAmount: 21, subsidyAmount: 21, selfpayAmount: 0, payType: 'subsidy',
    userId: 'u001', userName: '张三',
    createdAt: new Date('2026-06-19 11:50:00').getTime(), status: 'completed'
  }
];

export const mockConsumeStats: ConsumeStats = {
  todayOrders: 3,
  todayAmount: 87,
  monthOrders: 15,
  monthAmount: 568.5,
  subsidyTotal: 536.5,
  selfpayTotal: 32
};

export const mockStallSettlements: StallSettlement[] = [];
