// 设置页面
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useFileStore } from '../hooks/useFileStore';

export default function SettingsScreen() {
  const {
    themeMode,
    setThemeMode,
    viewMode,
    setViewMode,
    showHidden,
    toggleShowHidden,
  } = useFileStore();

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    right,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    right?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Icon name={icon} size={24} color={Colors.primary} />
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {right || (onPress && <Icon name="chevron-right" size={22} color={Colors.light.textHint} />)}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container}>
      <SectionHeader title="显示" />

      <SettingItem
        icon="palette"
        title="主题模式"
        subtitle={themeMode === 'light' ? '浅色' : themeMode === 'dark' ? '深色' : '跟随系统'}
        onPress={() => {
          const modes = ['light', 'dark', 'system'] as const;
          const currentIndex = modes.indexOf(themeMode);
          setThemeMode(modes[(currentIndex + 1) % modes.length]);
        }}
      />

      <SettingItem
        icon={viewMode === 'list' ? 'view-list' : 'grid-view'}
        title="默认视图"
        subtitle={viewMode === 'list' ? '列表视图' : '网格视图'}
        onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
      />

      <SettingItem
        icon="visibility"
        title="显示隐藏文件"
        subtitle="以.开头的文件和文件夹"
        right={
          <Switch
            value={showHidden}
            onValueChange={toggleShowHidden}
            trackColor={{ false: Colors.light.border, true: Colors.primaryLight }}
            thumbColor={showHidden ? Colors.primary : '#f4f3f4'}
          />
        }
      />

      <SectionHeader title="关于" />

      <SettingItem
        icon="info"
        title="版本"
        subtitle="LiteFiles v1.0.0"
      />

      <SettingItem
        icon="code"
        title="开源地址"
        subtitle="github.com/litefiles"
        onPress={() => Linking.openURL('https://github.com')}
      />

      <SettingItem
        icon="star"
        title="给个好评"
        subtitle="如果喜欢LiteFiles，请给个五星好评"
        onPress={() => {}}
      />

      <SettingItem
        icon="bug-report"
        title="反馈问题"
        subtitle="提交Bug或建议"
        onPress={() => {}}
      />

      {/* 底部信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>LiteFiles</Text>
        <Text style={styles.footerSubtext}>Less is More. Files Made Simple.</Text>
        <Text style={styles.footerSubtext}>❤️ 无广告 · 无追踪 · 开源</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  sectionHeader: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
  },
  settingInfo: { flex: 1, marginLeft: Spacing.md },
  settingTitle: { fontSize: FontSize.md, color: Colors.light.text, fontWeight: '500' },
  settingSubtitle: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 2 },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingBottom: 60,
  },
  footerText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  footerSubtext: {
    fontSize: FontSize.sm,
    color: Colors.light.textHint,
    marginTop: 4,
  },
});
