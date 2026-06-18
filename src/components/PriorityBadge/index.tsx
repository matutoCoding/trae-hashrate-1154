import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { OrderPriority } from '@/types';

interface PriorityBadgeProps {
  priority: OrderPriority;
}

const labelMap: Record<OrderPriority, string> = {
  normal: '普通',
  urgent: '加急',
  vip: 'VIP'
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <View className={classnames(styles.badge, styles[priority])}>
      <Text>{labelMap[priority]}</Text>
    </View>
  );
};

export default PriorityBadge;
