// 首页 - 智能首页设计
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { FILE_CATEGORIES } from '../constants/fileTypes';
import { formatFileSize, formatDate, formatStorage } from '../utils/formatters';
import FileService, { StorageInfo, FileItem } from '../services/FileService';
import { useFileStore } from '../hooks/useFileStore';

export default function HomeScreen({ navigation }: any) {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { addRecentFile } = useFileStore();

  const loadData = useCallback(async () => {
    const storage = await FileService.getStorageInfo();
    setStorageInfo(storage);

    // 加载最近文件（从根目录扫描最近修改的文件）
    const rootPath = FileService.getRootPath();
    try {
      const files = await FileService.listDirectory(rootPath);
      const recent = files
        .filter(f => !f.isDirectory)
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
        .slice(0, 10);
      setRecentFiles(recent);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const navigateToCategory = (category: any) => {
    navigation.navigate('Category', {
      categoryId: category.id,
      title: category.name,
    });
  };

  const openFile = (file: FileItem) => {
    addRecentFile(file);
    navigation.navigate('FileDetail', { filePath: file.path });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LiteFiles</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.headerButton}
        >
          <Icon name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 存储空间卡片 */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Icon name="storage" size={22} color={Colors.primary} />
            <Text style={styles.storageTitle}>存储空间</Text>
          </View>
          {storageInfo && (
            <>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(storageInfo.usedPercentage, 100)}%`,
                      backgroundColor:
                        storageInfo.usedPercentage > 90
                          ? Colors.danger
                          : storageInfo.usedPercentage > 70
                          ? Colors.warning
                          : Colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.storageText}>
                {formatStorage(storageInfo.usedSpace, storageInfo.totalSpace)}
              </Text>
            </>
          )}
        </View>

        {/* 快捷分类 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ 快捷分类</Text>
          <View style={styles.categoryGrid}>
            {FILE_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => navigateToCategory(category)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '15' }]}>
                  <Icon name={category.icon} size={28} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 最近文件 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 最近文件</Text>
          {recentFiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="folder-open" size={48} color={Colors.light.textHint} />
              <Text style={styles.emptyText}>暂无最近文件</Text>
            </View>
          ) : (
            recentFiles.map((file, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => openFile(file)}
                activeOpacity={0.6}
              >
                <Icon
                  name={file.isDirectory ? 'folder' : 'insert-drive-file'}
                  size={36}
                  color={file.isDirectory ? '#FFC107' : Colors.primary}
                />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.recentMeta}>
                    {formatFileSize(file.size)} · {formatDate(file.mtime)}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={Colors.light.textHint} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + Spacing.md : Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: '#fff',
  },
  headerButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  // 存储空间卡片
  storageCard: {
    backgroundColor: Colors.light.surface,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  storageTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: Spacing.sm,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.light.divider,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  storageText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
  },
  // 分类
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSize.sm,
    color: Colors.light.text,
    fontWeight: '500',
  },
  // 最近文件
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  recentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  recentName: {
    fontSize: FontSize.md,
    color: Colors.light.text,
    fontWeight: '500',
  },
  recentMeta: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.light.textHint,
    marginTop: Spacing.sm,
  },
});
