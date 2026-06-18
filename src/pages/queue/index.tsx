import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import QueueCard from '@/components/QueueCard';
import StatCard from '@/components/StatCard';
import { useQueueStore } from '@/store/queueStore';
import { queueService } from '@/services/queueService';

const QueuePage: React.FC = () => {
  const callingNumber = useQueueStore(s => s.callingNumber);
  const stats = useQueueStore(s => s.stats);
  const orders = useQueueStore(s => s.getSortedOrders());
  const callNextNumber = useQueueStore(s => s.callNextNumber);

  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status === 'waiting' || o.status === 'preparing' || o.status === 'ready');
  }, [orders]);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 500);
  });

  const handleCallNext = () => {
    const next = callNextNumber();
    if (next) {
      Taro.showToast({ title: `叫号 ${next.orderNumber}`, icon: 'none' });
      console.log('[QueuePage] callNext:', next.orderNumber);
    } else {
      Taro.showToast({ title: '暂无等待订单', icon: 'none' });
    }
  };

  const handleTakeNumber = () => {
    Taro.navigateTo({ url: '/pages/take-number/index' });
  };

  const handleOrderClick = (order) => {
    Taro.showModal({
      title: `${order.orderNumber} - ${order.stallName}`,
      content: `顾客：${order.customerName}\n菜品：${order.items.join('、')}\n状态：${queueService.getStatusLabel(order.status)}`,
      showCancel: false
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.currentCalling}>
        <Text className={styles.callingLabel}>当前叫号</Text>
        <Text className={styles.callingNumber}>{callingNumber}</Text>
        <View className={styles.callingRow}>
          <Text className={styles.callingInfo}>今日已完成 {stats.todayCompleted} 单</Text>
          <Button className={styles.callButton} onClick={handleCallNext}>
            叫下一个
          </Button>
        </View>
      </View>

      <ScrollView
        className={styles.statsScroll}
        scrollX
        enhanced
        showScrollbar={false}
      >
        <View className={styles.statsContainer}>
          <View className={styles.statItem}>
            <StatCard label="等待中" value={stats.totalWaiting} color="#FF6B35" />
          </View>
          <View className={styles.statItem}>
            <StatCard label="VIP" value={stats.vipWaiting} color="#FFB800" />
          </View>
          <View className={styles.statItem}>
            <StatCard label="加急" value={stats.urgentWaiting} color="#FF7D00" />
          </View>
          <View className={styles.statItem}>
            <StatCard label="普通" value={stats.normalWaiting} color="#165DFF" />
          </View>
          <View className={styles.statItem}>
            <StatCard label="均等待" value={stats.avgWaitTime} suffix="分钟" color="#00B42A" />
          </View>
        </View>
      </ScrollView>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>排队队列</Text>
        <Text className={styles.sectionCount}>共 {activeOrders.length} 单</Text>
      </View>

      <View className={styles.queueList}>
        {activeOrders.length > 0 ? (
          activeOrders.map(order => (
            <QueueCard key={order.id} order={order} onClick={() => handleOrderClick(order)} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🍽️</Text>
            <Text className={styles.emptyText}>暂无排队订单</Text>
          </View>
        )}
      </View>

      <Button className={styles.takeNumberButton} onClick={handleTakeNumber}>
        立即取号
      </Button>
    </View>
  );
};

export default QueuePage;
