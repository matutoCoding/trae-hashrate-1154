import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import QueueCard from '@/components/QueueCard';
import PriorityBadge from '@/components/PriorityBadge';
import { useQueueStore, stallList } from '@/store/queueStore';
import { queueService } from '@/services/queueService';
import type { OrderPriority } from '@/types';
import dayjs from 'dayjs';

type TabType = 'queue' | 'records';

const PriorityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const rawOrders = useQueueStore(s => s.orders);
  const cutRecords = useQueueStore(s => s.cutLineRecords);
  const insertPriorityOrder = useQueueStore(s => s.insertPriorityOrder);
  const getSortedOrders = useQueueStore(s => s.getSortedOrders);
  const refreshStats = useQueueStore(s => s.refreshStats);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  useDidShow(() => {
    refreshStats();
  });

  usePullDownRefresh(() => {
    refreshStats();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const allOrders = useMemo(() => getSortedOrders(), [rawOrders, getSortedOrders]);

  const priorityOrders = useMemo(() => {
    return allOrders.filter(
      o => (o.priority === 'vip' || o.priority === 'urgent')
      && (o.status === 'waiting' || o.status === 'preparing' || o.status === 'ready')
    );
  }, [allOrders]);

  const handleInsertOrder = (priority: OrderPriority) => {
    const label = priority === 'vip' ? 'VIP' : '加急';
    const stall = stallList[Math.floor(Math.random() * stallList.length)];
    const customerNames = ['王经理', '李总', '张总监', '赵主任'];
    const name = customerNames[Math.floor(Math.random() * customerNames.length)];
    const reasons = priority === 'vip'
      ? 'VIP会员优先服务'
      : '会议加急，30分钟内需用餐';

    Taro.showModal({
      title: `新增${label}单`,
      editable: true,
      placeholderText: `请输入${label}原因`,
      content: reasons,
      confirmText: '确认插队',
      success: (res) => {
        if (res.confirm) {
          const finalReason = res.content || reasons;
          const result = insertPriorityOrder(
            {
              stallId: stall.id,
              stallName: stall.name,
              customerName: name,
              items: priority === 'vip' ? ['VIP特选套餐'] : ['加急商务套餐'],
              priority,
              status: 'waiting',
              estimatedTime: priority === 'vip' ? 5 : 8
            },
            finalReason,
            priority === 'vip' ? 'VIP系统' : '管理员'
          );
          Taro.showToast({
            title: `${label}单 ${result.order.orderNumber} 已排第${result.cutRecord.newPosition}位`,
            icon: 'success'
          });
          console.log('[PriorityPage] insert:', result.order.orderNumber, '原位置:', result.cutRecord.originalPosition, '→ 新位置:', result.cutRecord.newPosition);
        }
      }
    });
  };

  const handleRecordClick = (record) => {
    const affectedText = record.affectedOrders.length > 0
      ? `\n受影响订单：${record.affectedOrders.join('、')}`
      : '';
    Taro.showModal({
      title: `${record.orderNumber} 插队详情`,
      content: `原因：${record.reason}\n原位置：第${record.originalPosition}位 → 第${record.newPosition}位\n操作人：${record.operator}${affectedText}`,
      showCancel: false
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, activeTab === 'queue' ? styles.tabActive : styles.tabInactive)}
          onClick={() => setActiveTab('queue')}
        >
          优先队列
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'records' ? styles.tabActive : styles.tabInactive)}
          onClick={() => setActiveTab('records')}
        >
          插队留痕
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        {activeTab === 'queue' && (
          <>
            <View className={styles.actionRow}>
              <Button
                className={classnames(styles.actionBtn, styles.vipBtn)}
                onClick={() => handleInsertOrder('vip')}
              >
                + VIP插队
              </Button>
              <Button
                className={classnames(styles.actionBtn, styles.urgentBtn)}
                onClick={() => handleInsertOrder('urgent')}
              >
                + 加急插队
              </Button>
            </View>

            <View className={styles.sectionTitleRow}>
              <Text className={styles.sectionTitle}>VIP / 加急订单</Text>
              <Text className={styles.countBadge}>{priorityOrders.length}</Text>
            </View>

            {priorityOrders.length > 0 ? (
              priorityOrders.map(order => (
                <QueueCard
                  key={order.id}
                  order={order}
                  onClick={() => console.log('click', order.id)}
                />
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>⭐</Text>
                <Text className={styles.emptyText}>暂无优先订单</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'records' && (
          <>
            <View className={styles.sectionTitleRow}>
              <Text className={styles.sectionTitle}>插队记录（公平性留痕）</Text>
              <Text className={styles.countBadge}>{cutRecords.length}</Text>
            </View>

            {cutRecords.length > 0 ? (
              cutRecords.map(record => (
                <View
                  key={record.id}
                  className={styles.cutCard}
                  onClick={() => handleRecordClick(record)}
                >
                  <View className={styles.cutHeader}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                      <Text className={styles.cutNumber}>{record.orderNumber}</Text>
                      <PriorityBadge priority={record.priority} />
                    </View>
                    <Text className={styles.cutTime}>
                      {dayjs(record.timestamp).format('MM-DD HH:mm')}
                    </Text>
                  </View>
                  <Text className={styles.cutReason}>{record.reason}</Text>
                  <View className={styles.cutMeta}>
                    <Text className={styles.metaItem}>
                      位置：<Text className={styles.metaHighlight}>第{record.originalPosition}位</Text> → <Text className={styles.metaHighlight}>第{record.newPosition}位</Text>
                    </Text>
                    <Text className={styles.metaItem}>操作人：{record.operator}</Text>
                  </View>
                  {record.affectedOrders.length > 0 && (
                    <View className={styles.affectedSection}>
                      <Text className={styles.affectedLabel}>受影响订单（{record.affectedOrders.length}个）：</Text>
                      <View className={styles.affectedOrders}>
                        {record.affectedOrders.slice(0, 5).map(num => (
                          <Text key={num} className={styles.affectedTag}>{num}</Text>
                        ))}
                        {record.affectedOrders.length > 5 && (
                          <Text className={styles.affectedTag}>
                            +{record.affectedOrders.length - 5}个
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📋</Text>
                <Text className={styles.emptyText}>暂无插队记录</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default PriorityPage;
