import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { stallList, useQueueStore } from '@/store/queueStore';
import type { Stall } from '@/types';

const TakeNumberPage: React.FC = () => {
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<string[]>(['']);
  const addOrder = useQueueStore(s => s.addOrder);

  const handleSelectStall = (stall: Stall) => {
    setSelectedStall(stall);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, '']);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setItems(['']);
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!selectedStall) {
      Taro.showToast({ title: '请选择档口', icon: 'none' });
      return;
    }
    if (!customerName.trim()) {
      Taro.showToast({ title: '请输入顾客姓名', icon: 'none' });
      return;
    }
    const validItems = items.filter(i => i.trim().length > 0);
    if (validItems.length === 0) {
      Taro.showToast({ title: '请至少填写一道菜品', icon: 'none' });
      return;
    }

    const newOrder = addOrder({
      stallId: selectedStall.id,
      stallName: selectedStall.name,
      customerName: customerName.trim(),
      items: validItems,
      priority: 'normal',
      status: 'waiting',
      estimatedTime: 10 + Math.floor(Math.random() * 10)
    });

    console.log('[TakeNumberPage] submit success:', newOrder.orderNumber, '档口:', selectedStall.name);

    Taro.showToast({
      title: `取号成功 ${newOrder.orderNumber}`,
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const canSubmit = selectedStall && customerName.trim() && items.some(i => i.trim().length > 0);

  return (
    <View className={styles.pageContainer}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择档口</Text>
        <View className={styles.stallGrid}>
          {stallList.map(stall => (
            <View
              key={stall.id}
              className={classnames(
                styles.stallItem,
                selectedStall?.id === stall.id && styles.stallSelected
              )}
              onClick={() => handleSelectStall(stall)}
            >
              <View className={styles.stallIcon}>
                <Text>�</Text>
              </View>
              <Text className={styles.stallName}>{stall.name}</Text>
              <Text className={styles.stallCategory}>{stall.category}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>顾客信息</Text>
        <View className={styles.formRow}>
          <Text className={styles.formLabel}>顾客姓名</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入顾客姓名"
            value={customerName}
            onInput={(e) => setCustomerName(e.detail.value)}
            maxlength={20}
          />
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>菜品信息</Text>
        <View className={styles.itemList}>
          {items.map((item, index) => (
            <View className={styles.itemRow} key={index}>
              <Input
                className={styles.itemInput}
                placeholder={`请输入菜品 ${index + 1}`}
                value={item}
                onInput={(e) => handleItemChange(index, e.detail.value)}
                maxlength={30}
              />
              <Button
                className={styles.deleteBtn}
                onClick={() => handleRemoveItem(index)}
              >
                ×
              </Button>
            </View>
          ))}
        </View>
        <Button className={styles.addItemBtn} onClick={handleAddItem}>
          + 添加菜品
        </Button>
      </View>

      <Button
        className={styles.submitBtn}
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        确认取号
      </Button>
    </View>
  );
};

export default TakeNumberPage;
