import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import StatCard from '@/components/StatCard';
import { useOrderStore } from '@/store/orderStore';
import dayjs from 'dayjs';

type TabType = 'orders' | 'settlement';

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const orders = useOrderStore(s => s.orders);
  const stats = useOrderStore(s => s.stats);
  const settlements = useOrderStore(s => s.settlements);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const handleOrderClick = (order) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.headerSection}>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <StatCard label="今日订单" value={stats.todayOrders} suffix="单" color="#FF6B35" />
          </View>
          <View className={styles.statItem}>
            <StatCard label="今日消费" value={`¥${stats.todayAmount.toFixed(2)}`} color="#165DFF" />
          </View>
        </View>

        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>本月消费概览</Text>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>订单数</Text>
            <Text className={styles.summaryValue}>{stats.monthOrders} 单</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>总金额</Text>
            <Text className={styles.summaryValue}>¥{stats.monthAmount.toFixed(2)}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>餐补支付</Text>
            <Text className={classnames(styles.summaryValue, styles.subsidyValue)}>
              ¥{stats.subsidyTotal.toFixed(2)}
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>自费支付</Text>
            <Text className={classnames(styles.summaryValue, styles.selfpayValue)}>
              ¥{stats.selfpayTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, activeTab === 'orders' ? styles.tabActive : styles.tabInactive)}
          onClick={() => setActiveTab('orders')}
        >
          消费订单
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'settlement' ? styles.tabActive : styles.tabInactive)}
          onClick={() => setActiveTab('settlement')}
        >
          档口分账
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        {activeTab === 'orders' && (
          <>
            <View className={styles.sectionTitleRow}>
              <Text className={styles.sectionTitle}>全部订单</Text>
              <Text className={styles.countBadge}>{orders.length}</Text>
            </View>

            {orders.length > 0 ? (
              orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => handleOrderClick(order)}
                />
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📝</Text>
                <Text className={styles.emptyText}>暂无消费记录</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'settlement' && (
          <>
            <View className={styles.sectionTitleRow}>
              <Text className={styles.sectionTitle}>档口分账结算</Text>
              <Text className={styles.countBadge}>{settlements.length}</Text>
            </View>

            {settlements.length > 0 ? (
              settlements.map(item => (
                <View key={item.id} className={styles.stallCard}>
                  <View className={styles.stallHeader}>
                    <Text className={styles.stallName}>{item.stallName}</Text>
                    <Text className={styles.stallPeriod}>{item.period}</Text>
                  </View>
                  <View className={styles.stallStats}>
                    <View className={styles.stallStatItem}>
                      <Text className={styles.stallStatLabel}>订单数</Text>
                      <Text className={styles.stallStatValue}>{item.totalOrders} 单</Text>
                    </View>
                    <View className={styles.stallStatItem}>
                      <Text className={styles.stallStatLabel}>结算金额</Text>
                      <Text className={classnames(styles.stallStatValue, styles.orange)}>
                        ¥{item.settledAmount.toFixed(2)}
                      </Text>
                    </View>
                    <View className={styles.stallStatItem}>
                      <Text className={styles.stallStatLabel}>餐补收入</Text>
                      <Text className={classnames(styles.stallStatValue, styles.green)}>
                        ¥{item.subsidyAmount.toFixed(2)}
                      </Text>
                    </View>
                    <View className={styles.stallStatItem}>
                      <Text className={styles.stallStatLabel}>自费收入</Text>
                      <Text className={classnames(styles.stallStatValue, styles.orange)}>
                        ¥{item.selfpayAmount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>🏪</Text>
                <Text className={styles.emptyText}>暂无分账记录</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default RecordsPage;
