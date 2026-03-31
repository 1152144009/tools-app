// 分类浏览页面
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { getFileIcon } from '../constants/fileTypes';
import { formatFileSize, formatDate } from '../utils/formatters';
import FileService, { FileItem } from '../services/FileService';

export default function CategoryScreen({ route, navigation }: any) {
  const { categoryId, title } = route.params;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [categoryId]);

  const loadFiles = async () => {
    setLoading(true);
    const rootPath = FileService.getRootPath();
    const items = await FileService.getFilesByCategory(rootPath, categoryId);
    setFiles(items);
    setLoading(false);
  };

  const openFile = (file: FileItem) => {
    navigation.navigate('FileDetail', { filePath: file.path });
  };

  // 图片类型使用网格视图
  const isImageCategory = categoryId === 'image';

  const renderImageItem = ({ item }: { item: FileItem }) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => openFile(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: `file://${item.path}` }} style={styles.thumbnail} />
      <Text style={styles.imageName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: FileItem }) => {
    const { icon, color } = getFileIcon(item.name, false);
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => openFile(item)}
        activeOpacity={0.6}
      >
        <Icon name={icon} size={36} color={color} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemMeta}>
            {formatFileSize(item.size)} · {formatDate(item.mtime)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>正在扫描 {title}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.countText}>{files.length} 个文件</Text>

      {isImageCategory ? (
        <FlatList
          data={files}
          keyExtractor={(item) => item.path}
          renderItem={renderImageItem}
          numColumns={3}
          contentContainerStyle={styles.imageGrid}
        />
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.path}
          renderItem={renderListItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="folder-open" size={64} color={Colors.light.textHint} />
              <Text style={styles.emptyText}>没有找到 {title} 文件</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: FontSize.md, color: Colors.light.textSecondary, marginTop: Spacing.md },
  countText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },

  // 图片网格
  imageGrid: { paddingHorizontal: Spacing.xs },
  imageItem: {
    flex: 1 / 3,
    margin: 2,
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.light.divider,
  },
  thumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageName: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: 10,
    padding: 4,
  },

  // 列表项
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
  },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemName: { fontSize: FontSize.md, color: Colors.light.text, fontWeight: '500' },
  itemMeta: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 2 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: FontSize.md, color: Colors.light.textHint, marginTop: Spacing.sm },
});
