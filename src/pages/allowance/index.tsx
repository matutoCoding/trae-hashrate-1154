import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatCard from '@/components/StatCard';
import { useAllowanceStore } from '@/store/allowanceStore';
import { allowanceService } from '@/services/allowanceService';
import dayjs from 'dayjs';

const AllowancePage: React.FC = () => {
  const allowance = useAllowanceStore(s => s.allowance);
  const records = useAllowanceStore(s => s.records);
  const getRecordsByMonth = useAllowanceStore(s => s.getRecordsByMonth);
  const getMonthSummary = useAllowanceStore(s => s.getMonthSummary);
  const toggleSelfPayMode = useAllowanceStore(s => s.toggleSelfPayMode);
  const resetMonthly = useAllowanceStore(s => s.resetMonthly);
  const grant = useAllowanceStore(s => s.grant);
  const checkAndResetMonthly = useAllowanceStore(s => s.checkAndResetMonthly);

  const currentMonth = allowanceService.getCurrentMonth();
  const lastMonth = allowanceService.getLastMonth();
  const [viewMonth, setViewMonth] = useState<string>(currentMonth);

  useEffect(() => {
    const reset = checkAndResetMonthly();
    if (reset) {
      Taro.showToast({ title: '已自动切换到本月额度', icon: 'none', duration: 2000 });
    }
  }, []);

  useDidShow(() => {
    const reset = checkAndResetMonthly();
    if (reset) {
      Taro.showToast({ title: '已自动切换到本月额度', icon: 'none', duration: 2000 });
      setViewMonth(allowanceService.getCurrentMonth());
    }
  });

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const isCurrentMonth = viewMonth === currentMonth;

  const monthRecords = useMemo(
    () => getRecordsByMonth(viewMonth).sort((a, b) => b.timestamp - a.timestamp),
    [viewMonth, records, getRecordsByMonth]
  );

  const monthSummary = useMemo(
    () => getMonthSummary(viewMonth),
    [viewMonth, records, getMonthSummary]
  );

  const usedForMonth = monthSummary.totalConsume;
  const quotaForMonth = monthSummary.totalGrant || allowance.monthlyQuota;
  const remainingForMonth = isCurrentMonth ? allowance.remainingAmount : monthSummary.remaining;

  const usagePercent = useMemo(() => {
    if (quotaForMonth <= 0) return 0;
    return Math.min(100, Math.round((usedForMonth / quotaForMonth) * 100));
  }, [usedForMonth, quotaForMonth]);

  const progressClass = useMemo(() => {
    if (usagePercent >= 90) return styles.dangerFill;
    if (usagePercent >= 70) return styles.warnFill;
    return '';
  }, [usagePercent]);

  const daysUntilReset = allowanceService.getDaysUntilReset();

  const handleMonthChange = (month: string) => {
    setViewMonth(month);
  };

  const handleToggleSelfPay = () => {
    if (!isCurrentMonth) {
      Taro.showToast({ title: '请切换到本月进行操作', icon: 'none' });
      return;
    }
    const nextMode = !allowance.isSelfPayMode;
    Taro.showModal({
      title: nextMode ? '切换至自费模式' : '切换至餐补模式',
      content: nextMode
        ? '开启后，所有消费将优先使用自费方式，不扣减餐补额度。'
        : '开启后，消费将优先使用餐补额度，额度用完后自动转自费。',
      success: (res) => {
        if (res.confirm) {
          toggleSelfPayMode();
          Taro.showToast({ title: '模式已切换', icon: 'success' });
          console.log('[AllowancePage] toggle mode to:', nextMode ? 'selfpay' : 'subsidy');
        }
      }
    });
  };

  const handleReset = () => {
    if (!isCurrentMonth) {
      Taro.showToast({ title: '请切换到本月进行操作', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认重置月度额度',
      content: '本月剩余额度将被清零，并发放新的月度额度。上月额度不累加。',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          resetMonthly();
          Taro.showToast({ title: '额度已重置', icon: 'success' });
          console.log('[AllowancePage] monthly reset done');
        }
      }
    });
  };

  const handleGrant = () => {
    if (!isCurrentMonth) {
      Taro.showToast({ title: '请切换到本月进行操作', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '发放临时额度',
      editable: true,
      placeholderText: '请输入发放金额',
      content: '50',
      success: (res) => {
        if (res.confirm) {
          const amount = parseFloat(res.content || '0');
          if (isNaN(amount) || amount <= 0) {
            Taro.showToast({ title: '请输入有效金额', icon: 'none' });
            return;
          }
          grant(amount, `${allowanceService.formatMonthLabel(viewMonth)} 临时额度发放 ¥${amount}`);
          Taro.showToast({ title: `已发放 ¥${amount}`, icon: 'success' });
          console.log('[AllowancePage] grant amount:', amount);
        }
      }
    });
  };

  const getTypeTag = (type) => {
    const map = {
      grant: { label: '发放', className: 'typeGrant' },
      consume: { label: '消费', className: 'typeConsume' },
      reset: { label: '重置', className: 'typeReset' }
    };
    return map[type] || map.consume;
  };

  const cardClass = isCurrentMonth ? styles.allowanceCard : styles.historyCard;

  const handleRecordClick = (record) => {
    if (record.type === 'consume' && record.relatedConsumeOrderId) {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${record.relatedConsumeOrderId}` });
    } else if (record.type === 'consume') {
      Taro.showToast({ title: '暂无关联订单详情', icon: 'none' });
    }
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.monthTabs}>
        <View
          className={classnames(styles.monthTab, isCurrentMonth && styles.monthTabActive)}
          onClick={() => handleMonthChange(currentMonth)}
        >
          本月 ({allowanceService.formatMonthLabel(currentMonth)})
        </View>
        <View
          className={classnames(styles.monthTab, !isCurrentMonth && styles.monthTabActive)}
          onClick={() => handleMonthChange(lastMonth)}
        >
          上月 ({allowanceService.formatMonthLabel(lastMonth)})
        </View>
      </View>

      <View className={cardClass}>
        <View className={styles.userInfo}>
          <View>
            <Text className={styles.userName}>{allowance.userName}</Text>
            <View className={styles.monthLabel}>
              {allowanceService.formatMonthLabel(viewMonth)} 餐补
              {!isCurrentMonth && '（历史）'}
            </View>
          </View>
          {isCurrentMonth ? (
            <Text className={styles.monthLabel}>距重置还有 {daysUntilReset} 天</Text>
          ) : (
            <Text className={styles.monthLabel}>已结算</Text>
          )}
        </View>

        <View className={styles.balanceSection}>
          <Text className={styles.balanceLabel}>
            {isCurrentMonth ? '剩余可用额度' : '月末剩余额度'}
          </Text>
          <View>
            <Text className={styles.balanceValue}>¥{remainingForMonth.toFixed(2)}</Text>
          </View>
        </View>

        <View className={styles.progressRow}>
          <Text className={styles.progressText}>
            已使用 ¥{usedForMonth.toFixed(2)} / ¥{quotaForMonth.toFixed(2)}
          </Text>
          <Text className={styles.progressText}>{usagePercent}%</Text>
        </View>
        <View className={styles.progressBar}>
          <View
            className={classnames(styles.progressFill, progressClass)}
            style={{ width: `${usagePercent}%` }}
          />
        </View>
      </View>

      <View className={styles.statsRow}>
        <StatCard label="已用额度" value={`¥${usedForMonth.toFixed(2)}`} color="#4E5969" />
        <StatCard label="发放总额" value={`¥${quotaForMonth.toFixed(2)}`} color="#52C41A" />
      </View>

      {isCurrentMonth && allowance.remainingAmount <= 0 && !allowance.isSelfPayMode && (
        <View className={styles.tipCard}>
          <Text className={styles.tipIcon}>⚠️</Text>
          <Text className={styles.tipText}>
            您的本月餐补额度已用完，后续消费将自动转为自费支付。下月1号将重置额度。
          </Text>
        </View>
      )}

      {isCurrentMonth && (
        <View className={styles.selfpayToggle}>
          <View>
            <Text className={styles.toggleLabel}>自费模式</Text>
            <View className={styles.toggleDesc}>
              {allowance.isSelfPayMode ? '当前：所有消费均为自费' : '当前：优先使用餐补额度'}
            </View>
          </View>
          <View
            className={classnames(styles.switch, allowance.isSelfPayMode && styles.switchActive)}
            onClick={handleToggleSelfPay}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
      )}

      {isCurrentMonth && (
        <View className={styles.actionRow}>
          <Button className={classnames(styles.actionBtn, styles.successBtn)} onClick={handleGrant}>
            + 发放额度
          </Button>
          <Button className={classnames(styles.actionBtn, styles.dangerBtn)} onClick={handleReset}>
            重置月度
          </Button>
        </View>
      )}

      <View className={styles.sectionTitleRow}>
        <Text className={styles.sectionTitle}>
          {allowanceService.formatMonthLabel(viewMonth)} 明细
        </Text>
        <Text className={styles.toggleDesc}>共 {monthRecords.length} 条</Text>
      </View>

      <View className={styles.recordList}>
        {monthRecords.length > 0 ? (
          monthRecords.map(record => {
            const tag = getTypeTag(record.type);
            const isConsume = record.type === 'consume';
            return (
              <View
                key={record.id}
                className={classnames(styles.recordItem, isConsume && styles.recordClickable)}
                onClick={() => isConsume && handleRecordClick(record)}
              >
                <View className={styles.recordLeft}>
                  <View className={styles.recordType}>
                    <Text className={classnames(styles.typeTag, styles[tag.className])}>
                      {tag.label}
                    </Text>
                  </View>
                  <Text className={styles.recordDesc}>{record.description}</Text>
                  <Text className={styles.recordTime}>
                    {dayjs(record.timestamp).format('MM-DD HH:mm')}
                  </Text>
                </View>
                <View className={styles.recordRight}>
                  <Text className={classnames(
                    styles.recordAmount,
                    record.type === 'consume' ? styles.amountMinus : styles.amountPlus
                  )}>
                    {record.type === 'consume' ? '-' : '+'}¥{record.amount.toFixed(2)}
                  </Text>
                  <Text className={styles.recordBalance}>余额 ¥{record.balanceAfter.toFixed(2)}</Text>
                  {isConsume && record.relatedConsumeOrderId && (
                    <Text className={styles.recordLink}>详情 ›</Text>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>💳</Text>
            <Text className={styles.emptyText}>暂无额度记录</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AllowancePage;
