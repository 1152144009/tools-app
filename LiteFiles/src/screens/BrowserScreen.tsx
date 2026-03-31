// 文件浏览器页面 - 核心浏览功能
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { getFileIcon } from '../constants/fileTypes';
import { formatFileSize, formatDate } from '../utils/formatters';
import FileService, { FileItem } from '../services/FileService';
import { useFileStore, SortBy } from '../hooks/useFileStore';

export default function BrowserScreen({ navigation }: any) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const {
    currentPath,
    setCurrentPath,
    pushPath,
    popPath,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    setSortBy,
    toggleSortOrder,
    showHidden,
    isSelecting,
    selectedFiles,
    setSelecting,
    toggleFileSelection,
    selectAll,
    clearSelection,
    clipboard,
    setClipboard,
    addRecentFile,
    isFavorite,
    addFavorite,
    removeFavorite,
  } = useFileStore();

  // 初始化根目录
  useEffect(() => {
    if (!currentPath) {
      setCurrentPath(FileService.getRootPath());
    }
  }, []);

  // 加载目录内容
  const loadFiles = useCallback(async () => {
    if (!currentPath) return;
    const items = await FileService.listDirectory(currentPath, showHidden);
    setFiles(sortFiles(items));
  }, [currentPath, showHidden, sortBy, sortOrder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // 排序文件
  const sortFiles = (items: FileItem[]): FileItem[] => {
    return [...items].sort((a, b) => {
      // 文件夹始终在前
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;

      let result = 0;
      switch (sortBy) {
        case 'name': result = a.name.localeCompare(b.name); break;
        case 'size': result = a.size - b.size; break;
        case 'date': result = a.mtime.getTime() - b.mtime.getTime(); break;
        case 'type': result = a.extension.localeCompare(b.extension); break;
      }
      return sortOrder === 'asc' ? result : -result;
    });
  };

  // 刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  }, [loadFiles]);

  // 点击文件/文件夹
  const handleItemPress = (item: FileItem) => {
    if (isSelecting) {
      toggleFileSelection(item);
      return;
    }

    if (item.isDirectory) {
      pushPath(item.path);
    } else {
      addRecentFile(item);
      navigation.navigate('FileDetail', { filePath: item.path });
    }
  };

  // 长按进入多选
  const handleItemLongPress = (item: FileItem) => {
    if (!isSelecting) {
      setSelecting(true);
      toggleFileSelection(item);
    }
  };

  // 返回上级目录
  const goBack = () => {
    const prev = popPath();
    if (!prev) {
      // 已经在根目录
    }
  };

  // 获取面包屑路径
  const getBreadcrumbs = (): { name: string; path: string }[] => {
    if (!currentPath) return [];
    const root = FileService.getRootPath();
    const relative = currentPath.replace(root, '');
    const parts = relative.split('/').filter(Boolean);

    const crumbs = [{ name: '内部存储', path: root }];
    let buildPath = root;
    for (const part of parts) {
      buildPath += '/' + part;
      crumbs.push({ name: part, path: buildPath });
    }
    return crumbs;
  };

  // 删除文件
  const handleDelete = () => {
    const count = selectedFiles.length;
    Alert.alert(
      '确认删除',
      `确定要删除 ${count} 个文件/文件夹吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            for (const file of selectedFiles) {
              await FileService.deleteFile(file.path);
            }
            clearSelection();
            loadFiles();
          },
        },
      ]
    );
  };

  // 复制/剪切
  const handleCopy = () => {
    setClipboard({ files: [...selectedFiles], operation: 'copy' });
    clearSelection();
  };

  const handleCut = () => {
    setClipboard({ files: [...selectedFiles], operation: 'cut' });
    clearSelection();
  };

  // 粘贴
  const handlePaste = async () => {
    if (!clipboard) return;
    for (const file of clipboard.files) {
      const destPath = `${currentPath}/${file.name}`;
      if (clipboard.operation === 'copy') {
        await FileService.copyFile(file.path, destPath);
      } else {
        await FileService.moveFile(file.path, destPath);
      }
    }
    setClipboard(null);
    loadFiles();
  };

  // 新建文件夹
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const path = `${currentPath}/${newFolderName.trim()}`;
    const success = await FileService.createDirectory(path);
    if (success) {
      setShowNewFolderModal(false);
      setNewFolderName('');
      loadFiles();
    }
  };

  // 渲染文件项（列表模式）
  const renderListItem = ({ item }: { item: FileItem }) => {
    const { icon, color } = getFileIcon(item.name, item.isDirectory);
    const isSelected = selectedFiles.some(f => f.path === item.path);

    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={() => handleItemPress(item)}
        onLongPress={() => handleItemLongPress(item)}
        activeOpacity={0.6}
      >
        {isSelecting && (
          <Icon
            name={isSelected ? 'check-box' : 'check-box-outline-blank'}
            size={22}
            color={isSelected ? Colors.primary : Colors.light.textHint}
            style={{ marginRight: Spacing.sm }}
          />
        )}
        <Icon name={icon} size={36} color={color} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemMeta}>
            {item.isDirectory ? '文件夹' : formatFileSize(item.size)} · {formatDate(item.mtime)}
          </Text>
        </View>
        {!isSelecting && (
          <Icon name="chevron-right" size={20} color={Colors.light.textHint} />
        )}
      </TouchableOpacity>
    );
  };

  // 渲染网格项
  const renderGridItem = ({ item }: { item: FileItem }) => {
    const { icon, color } = getFileIcon(item.name, item.isDirectory);
    const isSelected = selectedFiles.some(f => f.path === item.path);

    return (
      <TouchableOpacity
        style={[styles.gridItem, isSelected && styles.gridItemSelected]}
        onPress={() => handleItemPress(item)}
        onLongPress={() => handleItemLongPress(item)}
        activeOpacity={0.6}
      >
        {isSelecting && isSelected && (
          <View style={styles.gridCheckmark}>
            <Icon name="check-circle" size={20} color={Colors.primary} />
          </View>
        )}
        <Icon name={icon} size={48} color={color} />
        <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.gridMeta}>
          {item.isDirectory ? '' : formatFileSize(item.size)}
        </Text>
      </TouchableOpacity>
    );
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <View style={styles.container}>
      {/* 面包屑导航 */}
      <View style={styles.breadcrumbBar}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-back" size={22} color={Colors.light.text} />
        </TouchableOpacity>
        <FlatList
          data={breadcrumbs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setCurrentPath(item.path)}
              style={styles.breadcrumbItem}
            >
              <Text
                style={[
                  styles.breadcrumbText,
                  index === breadcrumbs.length - 1 && styles.breadcrumbActive,
                ]}
              >
                {item.name}
              </Text>
              {index < breadcrumbs.length - 1 && (
                <Icon name="chevron-right" size={16} color={Colors.light.textHint} />
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 工具栏 */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => setShowSortMenu(true)} style={styles.toolButton}>
          <Icon name="sort" size={20} color={Colors.light.icon} />
          <Text style={styles.toolText}>排序</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          style={styles.toolButton}
        >
          <Icon
            name={viewMode === 'list' ? 'grid-view' : 'view-list'}
            size={20}
            color={Colors.light.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowNewFolderModal(true)}
          style={styles.toolButton}
        >
          <Icon name="create-new-folder" size={20} color={Colors.light.icon} />
        </TouchableOpacity>

        {clipboard && (
          <TouchableOpacity onPress={handlePaste} style={styles.toolButton}>
            <Icon name="content-paste" size={20} color={Colors.accent} />
            <Text style={[styles.toolText, { color: Colors.accent }]}>粘贴</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 文件列表 */}
      <FlatList
        data={files}
        keyExtractor={(item) => item.path}
        renderItem={viewMode === 'list' ? renderListItem : renderGridItem}
        numColumns={viewMode === 'grid' ? 3 : 1}
        key={viewMode}
        contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : undefined}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="folder-open" size={64} color={Colors.light.textHint} />
            <Text style={styles.emptyText}>文件夹为空</Text>
          </View>
        }
      />

      {/* 多选操作栏 */}
      {isSelecting && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>已选 {selectedFiles.length} 项</Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity onPress={handleCopy} style={styles.selectionButton}>
              <Icon name="content-copy" size={22} color="#fff" />
              <Text style={styles.selectionBtnText}>复制</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCut} style={styles.selectionButton}>
              <Icon name="content-cut" size={22} color="#fff" />
              <Text style={styles.selectionBtnText}>移动</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.selectionButton}>
              <Icon name="delete" size={22} color="#fff" />
              <Text style={styles.selectionBtnText}>删除</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearSelection} style={styles.selectionButton}>
              <Icon name="close" size={22} color="#fff" />
              <Text style={styles.selectionBtnText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 排序菜单 */}
      <Modal visible={showSortMenu} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortMenu(false)}
        >
          <View style={styles.sortMenu}>
            <Text style={styles.sortMenuTitle}>排序方式</Text>
            {([
              { key: 'name', label: '名称', icon: 'sort-by-alpha' },
              { key: 'size', label: '大小', icon: 'data-usage' },
              { key: 'date', label: '日期', icon: 'access-time' },
              { key: 'type', label: '类型', icon: 'category' },
            ] as { key: SortBy; label: string; icon: string }[]).map(item => (
              <TouchableOpacity
                key={item.key}
                style={styles.sortMenuItem}
                onPress={() => {
                  if (sortBy === item.key) {
                    toggleSortOrder();
                  } else {
                    setSortBy(item.key);
                  }
                  setShowSortMenu(false);
                }}
              >
                <Icon name={item.icon} size={20} color={sortBy === item.key ? Colors.primary : Colors.light.icon} />
                <Text style={[styles.sortMenuText, sortBy === item.key && { color: Colors.primary }]}>
                  {item.label}
                </Text>
                {sortBy === item.key && (
                  <Icon
                    name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'}
                    size={18}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 新建文件夹弹窗 */}
      <Modal visible={showNewFolderModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.newFolderModal}>
            <Text style={styles.modalTitle}>新建文件夹</Text>
            <TextInput
              style={styles.modalInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="请输入文件夹名称"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleCreateFolder}
              >
                <Text style={styles.modalConfirmText}>创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },

  // 面包屑
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.border,
  },
  backButton: { padding: Spacing.sm },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  breadcrumbText: { fontSize: FontSize.sm, color: Colors.light.textSecondary },
  breadcrumbActive: { color: Colors.primary, fontWeight: '600' },

  // 工具栏
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.border,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
    padding: Spacing.xs,
  },
  toolText: {
    fontSize: FontSize.sm,
    color: Colors.light.icon,
    marginLeft: 4,
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
  listItemSelected: { backgroundColor: Colors.primaryLight + '30' },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemName: { fontSize: FontSize.md, color: Colors.light.text, fontWeight: '500' },
  itemMeta: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 2 },

  // 网格项
  gridContainer: { paddingHorizontal: Spacing.sm },
  gridItem: {
    flex: 1 / 3,
    alignItems: 'center',
    padding: Spacing.md,
    margin: Spacing.xs,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
  },
  gridItemSelected: { backgroundColor: Colors.primaryLight + '30' },
  gridCheckmark: { position: 'absolute', top: 4, right: 4 },
  gridName: { fontSize: FontSize.xs, color: Colors.light.text, textAlign: 'center', marginTop: 4 },
  gridMeta: { fontSize: 10, color: Colors.light.textSecondary, marginTop: 2 },

  // 空状态
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: FontSize.md, color: Colors.light.textHint, marginTop: Spacing.sm },

  // 多选操作栏
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  selectionText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
  selectionActions: { flexDirection: 'row' },
  selectionButton: { alignItems: 'center', marginLeft: Spacing.lg },
  selectionBtnText: { color: '#fff', fontSize: 10, marginTop: 2 },

  // 排序菜单
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortMenu: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '70%',
  },
  sortMenuTitle: { fontSize: FontSize.lg, fontWeight: '600', marginBottom: Spacing.md },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  sortMenuText: { flex: 1, fontSize: FontSize.md, marginLeft: Spacing.md, color: Colors.light.text },

  // 新建文件夹弹窗
  newFolderModal: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '80%',
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '600', marginBottom: Spacing.lg },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    marginBottom: Spacing.lg,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalCancelBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  modalCancelText: { color: Colors.light.textSecondary, fontSize: FontSize.md },
  modalConfirmBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.md,
  },
  modalConfirmText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
});
