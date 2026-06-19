import React, { useState, useMemo, useEffect } from 'react';
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
type SourceFilter = 'all' | 'queue' | 'direct' | 'imported';

const sourceLabel: Record<SourceFilter, string> = {
  all: '全部',
  queue: '取餐生成',
  direct: '直接消费',
  imported: '历史导入'
};

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [stallFilter, setStallFilter] = useState<StallFilter>('all');
  const [payFilter, setPayFilter] = useState<PayFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [settlementMonth, setSettlementMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  const rawOrders = useOrderStore(s => s.orders);
  const settlements = useOrderStore(s => s.settlements);
  const refreshSettlements = useOrderStore(s => s.refreshSettlements);
  const getOrdersByMonth = useOrderStore(s => s.getOrdersByMonth);

  useEffect(() => {
    refreshSettlements(settlementMonth);
  }, [settlementMonth, refreshSettlements]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    .toISOString().slice(0, 7);

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
    if (sourceFilter !== 'all') {
      result = result.filter(o => o.source === sourceFilter);
    }
    return result;
  }, [rawOrders, stallFilter, payFilter, sourceFilter]);

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
    refreshSettlements(settlementMonth);
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const handleOrderClick = (order) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` });
  };

  const handleStallClick = (stall) => {
    const monthOrders = getOrdersByMonth(settlementMonth)
      .filter(o => o.stallId === stall.stallId)
      .sort((a, b) => b.createdAt - a.createdAt);

    const itemsText = monthOrders.length > 0
      ? monthOrders.slice(0, 6).map(o =>
          `${dayjs(o.createdAt).format('MM-DD HH:mm')} ${o.orderNumber} ¥${o.totalAmount.toFixed(2)}`
        ).join('\n')
      : '暂无订单';

    const moreText = monthOrders.length > 6
      ? `\n...还有 ${monthOrders.length - 6} 笔`
      : '';

    Taro.showModal({
      title: `${stall.stallName} - ${settlementMonth} 订单明细`,
      content: `共 ${stall.totalOrders} 单，总金额 ¥${stall.totalAmount.toFixed(2)}\n\n${itemsText}${moreText}`,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#FF6B35'
    });
  };

  const isFiltering = stallFilter !== 'all' || payFilter !== 'all' || sourceFilter !== 'all';

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
                onClick={() => { setStallFilter('all'); setPayFilter('all'); setSourceFilter('all'); }}
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
              <View className={styles.filterRow}>
                <Text className={styles.filterLabel}>来源</Text>
                <View className={styles.filterOptions}>
                  <View
                    className={classnames(styles.filterChip, sourceFilter === 'all' && styles.filterChipActive)}
                    onClick={() => setSourceFilter('all')}
                  >
                    <Text>全部</Text>
                  </View>
                  <View
                    className={classnames(styles.filterChip, sourceFilter === 'queue' && styles.filterChipActive)}
                    onClick={() => setSourceFilter('queue')}
                  >
                    <Text>取餐生成</Text>
                  </View>
                  <View
                    className={classnames(styles.filterChip, sourceFilter === 'direct' && styles.filterChipActive)}
                    onClick={() => setSourceFilter('direct')}
                  >
                    <Text>直接消费</Text>
                  </View>
                  <View
                    className={classnames(styles.filterChip, sourceFilter === 'imported' && styles.filterChipActive)}
                    onClick={() => setSourceFilter('imported')}
                  >
                    <Text>历史导入</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className={styles.sectionTitleRow}>
              <Text className={styles.sectionTitle}>
                {isFiltering ? `筛选结果 · ${sourceLabel[sourceFilter]}` : '全部订单'}
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
            <View className={styles.monthTabs}>
              <View
                className={classnames(styles.monthTab, settlementMonth === currentMonth && styles.monthTabActive)}
                onClick={() => setSettlementMonth(currentMonth)}
              >
                本月 ({currentMonth})
              </View>
              <View
                className={classnames(styles.monthTab, settlementMonth === lastMonth && styles.monthTabActive)}
                onClick={() => setSettlementMonth(lastMonth)}
              >
                上月 ({lastMonth})
              </View>
            </View>

            <View className={styles.sectionTitleRow}>
              <Text className={styles.sectionTitle}>
                {settlementMonth === currentMonth ? '本月' : '上月'}档口分账
              </Text>
              <Text className={styles.countBadge}>{settlements.length}</Text>
            </View>

            {settlements.length > 0 ? (
              settlements.map(item => (
                <View
                  key={item.id}
                  className={classnames(styles.stallCard, styles.stallCardClickable)}
                  onClick={() => handleStallClick(item)}
                >
                  <View className={styles.stallHeader}>
                    <Text className={styles.stallName}>{item.stallName}</Text>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
                      <Text className={styles.stallPeriod}>{item.period}</Text>
                      <Text className={styles.stallArrow}>›</Text>
                    </View>
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
                <Text className={styles.emptyText}>该月暂无分账记录</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default RecordsPage;
