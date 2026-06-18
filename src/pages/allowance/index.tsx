import React, { useMemo, useEffect } from 'react';
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
  const toggleSelfPayMode = useAllowanceStore(s => s.toggleSelfPayMode);
  const resetMonthly = useAllowanceStore(s => s.resetMonthly);
  const grant = useAllowanceStore(s => s.grant);
  const checkAndResetMonthly = useAllowanceStore(s => s.checkAndResetMonthly);

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
    }
  });

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const usagePercent = useMemo(() => {
    if (allowance.monthlyQuota <= 0) return 0;
    return Math.min(100, Math.round((allowance.usedAmount / allowance.monthlyQuota) * 100));
  }, [allowance.usedAmount, allowance.monthlyQuota]);

  const progressClass = useMemo(() => {
    if (usagePercent >= 90) return styles.dangerFill;
    if (usagePercent >= 70) return styles.warnFill;
    return '';
  }, [usagePercent]);

  const daysUntilReset = allowanceService.getDaysUntilReset();

  const handleToggleSelfPay = () => {
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
          grant(amount, `临时额度发放 ¥${amount}`);
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

  const monthRecords = records.filter(r => r.month === allowance.currentMonth);

  return (
    <View className={styles.pageContainer}>
      <View className={styles.allowanceCard}>
        <View className={styles.userInfo}>
          <View>
            <Text className={styles.userName}>{allowance.userName}</Text>
            <View className={styles.monthLabel}>{allowance.currentMonth} 月度餐补</View>
          </View>
          <Text className={styles.monthLabel}>距重置还有 {daysUntilReset} 天</Text>
        </View>

        <View className={styles.balanceSection}>
          <Text className={styles.balanceLabel}>剩余可用额度</Text>
          <View>
            <Text className={styles.balanceValue}>¥{allowance.remainingAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View className={styles.progressRow}>
          <Text className={styles.progressText}>
            已使用 ¥{allowance.usedAmount.toFixed(2)} / ¥{allowance.monthlyQuota.toFixed(2)}
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
        <StatCard label="本月已用" value={`¥${allowance.usedAmount.toFixed(2)}`} color="#4E5969" />
        <StatCard label="月度额度" value={`¥${allowance.monthlyQuota.toFixed(2)}`} color="#52C41A" />
      </View>

      {allowance.remainingAmount <= 0 && !allowance.isSelfPayMode && (
        <View className={styles.tipCard}>
          <Text className={styles.tipIcon}>⚠️</Text>
          <Text className={styles.tipText}>
            您的本月餐补额度已用完，后续消费将自动转为自费支付。下月1号将重置额度。
          </Text>
        </View>
      )}

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

      <View className={styles.actionRow}>
        <Button className={classnames(styles.actionBtn, styles.successBtn)} onClick={handleGrant}>
          + 发放额度
        </Button>
        <Button className={classnames(styles.actionBtn, styles.dangerBtn)} onClick={handleReset}>
          重置月度
        </Button>
      </View>

      <View className={styles.sectionTitleRow}>
        <Text className={styles.sectionTitle}>额度明细</Text>
        <Text className={styles.toggleDesc}>本月 {monthRecords.length} 条</Text>
      </View>

      <View className={styles.recordList}>
        {monthRecords.length > 0 ? (
          monthRecords.map(record => {
            const tag = getTypeTag(record.type);
            return (
              <View key={record.id} className={styles.recordItem}>
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
