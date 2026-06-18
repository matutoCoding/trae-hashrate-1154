import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import PriorityBadge from '@/components/PriorityBadge';
import type { QueueOrder } from '@/types';

interface QueueCardProps {
  order: QueueOrder;
  onClick?: () => void;
}

const statusMap = {
  ready: { label: '待取餐', className: 'statusReady' },
  preparing: { label: '制作中', className: 'statusPreparing' },
  waiting: { label: '等待中', className: 'statusWaiting' },
  completed: { label: '已完成', className: 'statusWaiting' },
  cancelled: { label: '已取消', className: 'statusWaiting' }
};

const QueueCard: React.FC<QueueCardProps> = ({ order, onClick }) => {
  const status = statusMap[order.status] || statusMap.waiting;

  return (
    <View
      className={classnames(
        styles.card,
        order.priority === 'vip' && styles.vipBorder,
        order.priority === 'urgent' && styles.urgentBorder
      )}
      onClick={onClick}
    >
      <View className={styles.header}>
        <View className={styles.numberSection}>
          <Text className={styles.orderNumber}>{order.orderNumber}</Text>
          <PriorityBadge priority={order.priority} />
          {order.cutLine && <Text className={styles.cutLineTag}>已插队</Text>}
        </View>
        <Text className={styles.position}>
          {order.status === 'ready'
            ? '待取餐'
            : order.status === 'preparing'
              ? '制作中'
              : `第${order.queuePosition + 1}位`}
        </Text>
      </View>

      <View className={styles.body}>
        <View className={styles.info}>
          <Text className={styles.stallName}>{order.stallName}</Text>
          <Text className={styles.customer}>{order.customerName}</Text>
          <Text className={styles.items}>{order.items.join('、')}</Text>
        </View>

        <View className={styles.rightSection}>
          <Text className={classnames(styles.statusTag, styles[status.className])}>
            {status.label}
          </Text>
          {order.estimatedTime > 0 && order.status === 'waiting' && (
            <Text className={styles.estimated}>
              预计 <Text className={styles.estimatedTime}>{order.estimatedTime}</Text> 分钟
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default QueueCard;
