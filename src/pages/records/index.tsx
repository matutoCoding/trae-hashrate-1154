import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import StatCard from '@/components/StatCard';
import { useOrderStore } from '@/store/orderStore';
import dayjs from 'dayjs';

type TabType = 'orders' | 'settlement';
type StallFilter = 'all' | string;
type PayFilter = 'all' | 'subsidy' | 'selfpay' | 'mixed';

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [stallFilter, setStallFilter] = useState<StallFilter>('all');
  const [payFilter, setPayFilter] = useState<PayFilter>('all');

  const rawOrders = useOrderStore(s => s.orders);
  const settlements = useOrderStore(s => s.settlements);

  const stallOptions = useMemo(() => {
    const stallIds = new Set<string>();
    const stallNames = new Map<string, string>();
    rawOrders.forEach(o => {
      if (!stallIds.has(o.stallId)) {
        stallIds.add(o.stallId);
        stallNames.set(o.stallId, o.stallName);
      }
    });
    return Array.from(stallIds).map(id => ({ id, name: stallNames.get(id) || id }));
  }, [rawOrders]);

  const filteredOrders = useMemo(() => {
    let result = [...rawOrders];
    if (stallFilter !== 'all') {
      result = result.filter(o => o.stallId === stallFilter);
    }
    if (payFilter !== 'all') {
      result = result.filter(o => o.payType === payFilter);
    }
    return result;
  }, [rawOrders, stallFilter, payFilter]);

  const filteredStats = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();

    const todayFiltered = filteredOrders.filter(o => o.createdAt >= todayStart);
    const monthFiltered = filteredOrders.filter(o => o.createdAt >= monthStart);

    return {
      todayOrders: todayFiltered.length,
      todayAmount: todayFiltered.reduce((s, o) => s + o.totalAmount, 0),
      monthOrders: monthFiltered.length,
      monthAmount: monthFiltered.reduce((s, o) => s + o.totalAmount, 0),
      subsidyTotal: monthFiltered.reduce((s, o) => s + o.subsidyAmount, 0),
      selfpayTotal: monthFiltered.reduce((s, o) => s + o.selfpayAmount, 0)
    };
  }, [filteredOrders]);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const handleOrderClick = (order) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` });
  };

  const isFiltering = stallFilter !== 'all' || payFilter !== 'all';

  return (
    <View className={styles.pageContainer}>
      <View className={styles.headerSection}>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <StatCard label="今日订单" value={filteredStats.todayOrders} suffix="单" color="#FF6B35" />
          </View>
          <View className={styles.statItem}>
            <StatCard label="今日消费" value={`¥${filteredStats.todayAmount.toFixed(2)}`} color="#165DFF" />
          </View>
        </View>

        <View className={styles.summaryCard}>
          <View className={styles.summaryTitleRow}>
            <Text className={styles.summaryTitle}>
              {isFiltering ? '筛选后概览' : '本月消费概览'}
            </Text>
            {isFiltering && (
              <Text
                className={styles.clearFilter}
                onClick={() => { setStallFilter('all'); setPayFilter('all'); }}
              >
                清除筛选
              </Text>
            )}
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>订单数</Text>
            <Text className={styles.summaryValue}>{filteredStats.monthOrders} 单</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>总金额</Text>
            <Text className={styles.summaryValue}>¥{filteredStats.monthAmount.toFixed(2)}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>餐补支付</Text>
            <Text className={classnames(styles.summaryValue, styles.subsidyValue)}>
              ¥{filteredStats.subsidyTotal.toFixed(2)}
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>自费支付</Text>
            <Text className={classnames(styles.summaryValue, styles.selfpayValue)}>
              ¥{filteredStats.selfpayTotal.toFixed(2)}
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
            <View className={styles.filterSection}>
              <View className={styles.filterRow}>
                <Text className={styles.filterLabel}>档口</Text>
                <ScrollView scrollX className={styles.filterScroll}>
                  <View className={styles.filterOptions}>
                    <View
                      className={classnames(styles.filterChip, stallFilter === 'all' && styles.filterChipActive)}
                      onClick={() => setStallFilter('all')}
                    >
                      <Text>全部</Text>
                    </View>
                    {stallOptions.map(s => (
                      <View
                        key={s.id}
                        className={classnames(styles.filterChip, stallFilter === s.id && styles.filterChipActive)}
                        onClick={() => setStallFilter(s.id)}
                      >
                        <Text>{s.name}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <View className={styles.filterRow}>
                <Text className={styles.filterLabel}>支付</Text>
                <View className={styles.filterOptions}>
                  <View
                    className={classnames(styles.filterChip, payFilter === 'all' && styles.filterChipActive)}
                    onClick={() => setPayFilter('all')}
                  >
                    <Text>全部</Text>
                  </View>
                  <View
                    className={classnames(styles.filterChip, payFilter === 'subsidy' && styles.filterChipActive)}
                    onClick={() => setPayFilter('subsidy')}
                  >
                    <Text>餐补</Text>
                  </View>
                  <View
                    className={classnames(styles.filterChip, payFilter === 'selfpay' && styles.filterChipActive)}
                    onClick={() => setPayFilter('selfpay')}
                  >
                    <Text>自费</Text>
                  </View>
                  <View
                    className={classnames(styles.filterChip, payFilter === 'mixed' && styles.filterChipActive)}
                    onClick={() => setPayFilter('mixed')}
                  >
                    <Text>混合</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className={styles.sectionTitleRow}>
              <Text className={styles.sectionTitle}>
                {isFiltering ? '筛选结果' : '全部订单'}
              </Text>
              <Text className={styles.countBadge}>{filteredOrders.length}</Text>
            </View>

            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => handleOrderClick(order)}
                />
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📝</Text>
                <Text className={styles.emptyText}>暂无匹配的消费记录</Text>
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
