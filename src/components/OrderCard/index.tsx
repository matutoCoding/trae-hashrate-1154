import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { ConsumeOrder } from '@/types';
import dayjs from 'dayjs';

interface OrderCardProps {
  order: ConsumeOrder;
  onClick?: () => void;
  showDetailLink?: boolean;
}

const payTagMap = {
  subsidy: { label: '餐补', className: 'subsidyTag' },
  selfpay: { label: '自费', className: 'selfpayTag' },
  mixed: { label: '混合支付', className: 'mixedTag' }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, showDetailLink = true }) => {
  const payTag = payTagMap[order.payType];

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <Text className={styles.orderNumber}>{order.orderNumber}</Text>
        <Text className={styles.time}>{dayjs(order.createdAt).format('MM-DD HH:mm')}</Text>
      </View>

      <View className={styles.stallRow}>
        <Text className={styles.stallName}>{order.stallName}</Text>
        <Text className={styles.amount}>¥{order.totalAmount.toFixed(2)}</Text>
      </View>

      <View className={styles.itemsList}>
        {order.items.slice(0, 3).map((item, idx) => (
          <View className={styles.itemRow} key={idx}>
            <Text className={styles.itemName}>
              {item.name} × {item.quantity}
            </Text>
            <Text className={styles.itemPrice}>¥{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        {order.items.length > 3 && (
          <Text className={styles.itemName} style={{ color: '$color-text-tertiary' }}>
            共{order.items.length}件商品
          </Text>
        )}
      </View>

      <View className={styles.footer}>
        <View className={styles.payTags}>
          {order.subsidyAmount > 0 && (
            <Text className={classnames(styles.payTag, styles.subsidyTag)}>
              餐补¥{order.subsidyAmount.toFixed(2)}
            </Text>
          )}
          {order.selfpayAmount > 0 && (
            <Text className={classnames(styles.payTag, styles.selfpayTag)}>
              自费¥{order.selfpayAmount.toFixed(2)}
            </Text>
          )}
        </View>
        {showDetailLink && <Text className={styles.detailLink}>查看详情 ›</Text>}
      </View>
    </View>
  );
};

export default OrderCard;
