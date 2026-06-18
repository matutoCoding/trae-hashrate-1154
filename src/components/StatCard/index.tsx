import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  color?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, suffix, color, onClick }) => {
  return (
    <View className={styles.statCard} onClick={onClick}>
      <Text className={styles.statLabel}>{label}</Text>
      <Text
        className={styles.statValue}
        style={color ? { color } : undefined}
      >
        {value}
        {suffix && <Text className={styles.statSuffix}>{suffix}</Text>}
      </Text>
    </View>
  );
};

export default StatCard;
