// 文件详情页面
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { getFileIcon } from '../constants/fileTypes';
import { formatFileSize, formatDateTime } from '../utils/formatters';
import FileService, { FileItem } from '../services/FileService';

export default function FileDetailScreen({ route, navigation }: any) {
  const { filePath } = route.params;
  const [fileInfo, setFileInfo] = useState<FileItem | null>(null);

  useEffect(() => {
    loadFileInfo();
  }, [filePath]);

  const loadFileInfo = async () => {
    const info = await FileService.getFileInfo(filePath);
    setFileInfo(info);
  };

  const handleShare = async () => {
    try {
      await Share.open({ url: `file://${filePath}` });
    } catch (e) {
      // 用户取消分享
    }
  };

  const handleDelete = () => {
    Alert.alert('确认删除', `确定要删除 "${fileInfo?.name}" 吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const success = await FileService.deleteFile(filePath);
          if (success) {
            navigation.goBack();
          }
        },
      },
    ]);
  };

  const handleRename = () => {
    Alert.prompt(
      '重命名',
      '请输入新的文件名',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async (newName) => {
            if (newName && newName.trim()) {
              const success = await FileService.renameFile(filePath, newName.trim());
              if (success) {
                loadFileInfo();
              }
            }
          },
        },
      ],
      'plain-text',
      fileInfo?.name
    );
  };

  if (!fileInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const { icon, color } = getFileIcon(fileInfo.name, fileInfo.isDirectory);

  return (
    <ScrollView style={styles.container}>
      {/* 文件图标和名称 */}
      <View style={styles.headerCard}>
        <Icon name={icon} size={72} color={color} />
        <Text style={styles.fileName}>{fileInfo.name}</Text>
        <Text style={styles.fileSize}>{formatFileSize(fileInfo.size)}</Text>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Icon name="share" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>分享</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleRename}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.accent + '15' }]}>
            <Icon name="edit" size={24} color={Colors.accent} />
          </View>
          <Text style={styles.actionText}>重命名</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.danger + '15' }]}>
            <Icon name="delete" size={24} color={Colors.danger} />
          </View>
          <Text style={styles.actionText}>删除</Text>
        </TouchableOpacity>
      </View>

      {/* 文件详情 */}
      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>文件信息</Text>

        <DetailRow label="文件名" value={fileInfo.name} />
        <DetailRow label="路径" value={fileInfo.path} />
        <DetailRow label="大小" value={formatFileSize(fileInfo.size)} />
        <DetailRow label="类型" value={fileInfo.isDirectory ? '文件夹' : (fileInfo.extension || '未知')} />
        <DetailRow label="修改时间" value={formatDateTime(fileInfo.mtime)} />
        <DetailRow label="创建时间" value={formatDateTime(fileInfo.ctime)} />
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // 头部卡片
  headerCard: {
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.xxxl,
    marginBottom: Spacing.md,
  },
  fileName: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },

  // 操作按钮
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  actionButton: { alignItems: 'center' },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: FontSize.sm,
    color: Colors.light.text,
    marginTop: Spacing.xs,
  },

  // 详情卡片
  detailCard: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
  },
  detailTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
  },
  detailLabel: {
    width: 80,
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.light.text,
  },
});
