// 导航配置
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BrowserScreen from '../screens/BrowserScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CategoryScreen from '../screens/CategoryScreen';
import FileDetailScreen from '../screens/FileDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 底部Tab导航
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          switch (route.name) {
            case '首页': iconName = 'home'; break;
            case '浏览': iconName = 'folder'; break;
            case '搜索': iconName = 'search'; break;
            case '收藏': iconName = 'star'; break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: Colors.light.surface,
          borderTopWidth: 0.5,
          borderTopColor: Colors.light.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="首页" component={HomeScreen} />
      <Tab.Screen name="浏览" component={BrowserScreen} />
      <Tab.Screen name="搜索" component={SearchScreen} />
      <Tab.Screen name="收藏" component={FavoritesScreen} />
    </Tab.Navigator>
  );
}

// 主导航（Stack）
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '设置',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Category"
          component={CategoryScreen}
          options={({ route }: any) => ({
            title: route.params?.title || '分类',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          })}
        />
        <Stack.Screen
          name="FileDetail"
          component={FileDetailScreen}
          options={{
            title: '文件详情',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}