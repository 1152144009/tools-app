// LiteFiles - 轻量文件管理器
// "Less is More. Files Made Simple."

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { Colors } from './constants/theme';

// 忽略非关键警告
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

export default function App() {
  return (
    <>
      <StatusBar
        backgroundColor={Colors.primary}
        barStyle="light-content"
        translucent={false}
      />
      <AppNavigator />
    </>
  );
}
