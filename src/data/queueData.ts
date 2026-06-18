import type { Stall, QueueOrder, CutLineRecord, QueueStats } from '@/types';

export const stallList: Stall[] = [
  { id: 's001', name: '川香小厨', category: '川菜', image: 'https://picsum.photos/id/292/200/200' },
  { id: 's002', name: '粤式茶餐厅', category: '粤菜', image: 'https://picsum.photos/id/312/200/200' },
  { id: 's003', name: '日式拉面屋', category: '日料', image: 'https://picsum.photos/id/326/200/200' },
  { id: 's004', name: '西北牛肉面', category: '面食', image: 'https://picsum.photos/id/401/200/200' },
  { id: 's005', name: '麻辣香锅', category: '香锅', image: 'https://picsum.photos/id/431/200/200' },
  { id: 's006', name: '轻食沙拉吧', category: '轻食', image: 'https://picsum.photos/id/570/200/200' },
  { id: 's007', name: '港式烧腊饭', category: '港式', image: 'https://picsum.photos/id/580/200/200' },
  { id: 's008', name: '韩式拌饭', category: '韩餐', image: 'https://picsum.photos/id/625/200/200' }
];

export const mockQueueOrders: QueueOrder[] = [
  {
    id: 'q001', orderNumber: 'A001', stallId: 's001', stallName: '川香小厨',
    customerName: '张三', items: ['宫保鸡丁', '米饭'], priority: 'normal',
    status: 'ready', queuePosition: 0, estimatedTime: 0, createdAt: Date.now() - 600000,
    cutLine: false
  },
  {
    id: 'q002', orderNumber: 'A002', stallId: 's002', stallName: '粤式茶餐厅',
    customerName: '李四', items: ['虾饺皇', '叉烧包'], priority: 'vip',
    status: 'preparing', queuePosition: 1, estimatedTime: 3, createdAt: Date.now() - 300000,
    cutLine: true, cutLineRecordId: 'c001'
  },
  {
    id: 'q003', orderNumber: 'A003', stallId: 's003', stallName: '日式拉面屋',
    customerName: '王五', items: ['豚骨拉面', '煎饺'], priority: 'urgent',
    status: 'waiting', queuePosition: 2, estimatedTime: 8, createdAt: Date.now() - 180000,
    cutLine: true, cutLineRecordId: 'c002'
  },
  {
    id: 'q004', orderNumber: 'A004', stallId: 's001', stallName: '川香小厨',
    customerName: '赵六', items: ['麻婆豆腐', '米饭'], priority: 'normal',
    status: 'waiting', queuePosition: 3, estimatedTime: 12, createdAt: Date.now() - 120000,
    cutLine: false
  },
  {
    id: 'q005', orderNumber: 'A005', stallId: 's004', stallName: '西北牛肉面',
    customerName: '孙七', items: ['牛肉面', '卤蛋'], priority: 'normal',
    status: 'waiting', queuePosition: 4, estimatedTime: 15, createdAt: Date.now() - 60000,
    cutLine: false
  },
  {
    id: 'q006', orderNumber: 'A006', stallId: 's005', stallName: '麻辣香锅',
    customerName: '周八', items: ['麻辣香锅（荤素搭配）'], priority: 'vip',
    status: 'waiting', queuePosition: 5, estimatedTime: 18, createdAt: Date.now() - 30000,
    cutLine: false
  },
  {
    id: 'q007', orderNumber: 'A007', stallId: 's006', stallName: '轻食沙拉吧',
    customerName: '吴九', items: ['鸡胸肉沙拉', '美式咖啡'], priority: 'normal',
    status: 'waiting', queuePosition: 6, estimatedTime: 20, createdAt: Date.now() - 10000,
    cutLine: false
  },
  {
    id: 'q008', orderNumber: 'A008', stallId: 's002', stallName: '粤式茶餐厅',
    customerName: '郑十', items: ['肠粉', '皮蛋瘦肉粥'], priority: 'normal',
    status: 'waiting', queuePosition: 7, estimatedTime: 25, createdAt: Date.now(),
    cutLine: false
  }
];

export const mockCutLineRecords: CutLineRecord[] = [
  {
    id: 'c001', orderId: 'q002', orderNumber: 'A002',
    reason: 'VIP会员优先', priority: 'vip',
    originalPosition: 5, newPosition: 1, operator: '系统',
    timestamp: Date.now() - 280000,
    affectedOrders: ['A003', 'A004', 'A005', 'A006', 'A007', 'A008'],
    normalAffectedOrders: ['A004', 'A005', 'A007', 'A008']
  },
  {
    id: 'c002', orderId: 'q003', orderNumber: 'A003',
    reason: '会议加急，30分钟内需用餐', priority: 'urgent',
    originalPosition: 6, newPosition: 2, operator: '李经理',
    timestamp: Date.now() - 170000,
    affectedOrders: ['A004', 'A005', 'A006', 'A007', 'A008'],
    normalAffectedOrders: ['A004', 'A005', 'A007', 'A008']
  }
];

export const mockQueueStats: QueueStats = {
  totalActive: 8,
  readyCount: 1,
  preparingCount: 1,
  waitingCount: 6,
  vipCount: 2,
  urgentCount: 1,
  normalCount: 5,
  todayCompleted: 86,
  avgWaitTime: 12
};

export const currentCallingNumber: string = 'A001';
