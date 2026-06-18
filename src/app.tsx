import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';
import { useAllowanceStore } from '@/store/allowanceStore';
import { useQueueStore } from '@/store/queueStore';

function App(props) {
  useEffect(() => {
    useAllowanceStore.getState().checkAndResetMonthly();
    useQueueStore.getState().refreshStats();
    console.log('[App] initialized, stats and allowance checked');
  }, []);

  useDidShow(() => {
    useAllowanceStore.getState().checkAndResetMonthly();
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
