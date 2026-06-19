import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useOrderStore } from '@/store/orderStore';
import dayjs from 'dayjs';

const OrderDetailPage: React.FC = () => {
  const id = Taro.getCurrentInstance().router?.params?.id;
  const orders = useOrderStore(s => s.orders);
  const order = useMemo(() => orders.find(o => o.id === id), [orders, id]);

  if (!order) {
    return (
      <View className={styles.pageContainer}>
        <Text className={styles.emptyIcon}>📋</Text>
        <Text className={styles.emptyText}>订单不存在</Text>
      </View>
    );
  }

  const payTypeLabel = {
    subsidy: '餐补支付',
    selfpay: '自费支付',
    mixed: '混合支付'
  }[order.payType] || '未知';

  return (
    <View className={styles.pageContainer}>
      <View className={styles.orderHeader}>
        <Text className={styles.orderNumber}>{order.orderNumber}</Text>
        <Text className={styles.orderTime}>{dayjs(order.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
      </View>

      {order.queueOrderNumber && (
        <View className={styles.queueTag}>
          <Text className={styles.queueTagText}>来源排队号：{order.queueOrderNumber}</Text>
        </View>
      )}

      <View className={styles.infoCard}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>档口</Text>
          <Text className={styles.infoValue}>{order.stallName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>顾客</Text>
          <Text className={styles.infoValue}>{order.userName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>状态</Text>
          <Text className={styles.infoValue}>已完成</Text>
        </View>
      </View>

      <View className={styles.itemsCard}>
        <Text className={styles.cardTitle}>菜品明细</Text>
        {order.items.map((item, idx) => (
          <View key={idx} className={styles.itemRow}>
            <Text className={styles.itemName}>{item.name}</Text>
            <Text className={styles.itemQty}>×{item.quantity}</Text>
            <Text className={styles.itemPrice}>¥{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View className={styles.totalRow}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.totalAmount}>¥{order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View className={styles.payCard}>
        <Text className={styles.cardTitle}>支付信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>支付方式</Text>
          <Text className={styles.infoValue}>{payTypeLabel}</Text>
        </View>
        {order.subsidyAmount > 0 && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>餐补支付</Text>
            <Text className={classnames(styles.infoValue, styles.subsidyAmount)}>¥{order.subsidyAmount.toFixed(2)}</Text>
          </View>
        )}
        {order.selfpayAmount > 0 && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>自费支付</Text>
            <Text className={classnames(styles.infoValue, styles.selfpayAmount)}>¥{order.selfpayAmount.toFixed(2)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

function classnames(...args: any[]): string {
  return args.filter(Boolean).join(' ');
}

export default OrderDetailPage;
