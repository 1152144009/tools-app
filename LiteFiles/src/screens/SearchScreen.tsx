// 搜索页面 - 全局搜索 + 分组结果
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { getFileIcon, FILE_CATEGORIES } from '../constants/fileTypes';
import { formatFileSize, formatDate } from '../utils/formatters';
import FileService, { FileItem } from '../services/FileService';
import { useFileStore } from '../hooks/useFileStore';

interface SearchSection {
  title: string;
  icon: string;
  color: string;
  data: FileItem[];
}

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchSection[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const { searchHistory, addSearchHistory, addRecentFile } = useFileStore();

  // 执行搜索
  const doSearch = useCallback(async (searchText: string) => {
    if (!searchText.trim()) return;

    setSearching(true);
    setSearched(true);
    addSearchHistory(searchText.trim());

    const rootPath = FileService.getRootPath();
    const files = await FileService.searchFiles(rootPath, searchText.trim(), 200);

    // 按文件类型分组
    const groups: { [key: string]: FileItem[] } = {};
    for (const file of files) {
      const category = file.category || 'other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(file);
    }

    // 转换为SectionList数据格式
    const sections: SearchSection[] = Object.entries(groups).map(([catId, items]) => {
      const category = FILE_CATEGORIES.find(c => c.id === catId);
      return {
        title: category ? `${category.name} (${items.length})` : `其他 (${items.length})`,
        icon: category?.icon || 'insert-drive-file',
        color: category?.color || '#607D8B',
        data: items,
      };
    });

    setResults(sections);
    setSearching(false);
  }, [addSearchHistory]);

  // 点击文件
  const openFile = (file: FileItem) => {
    addRecentFile(file);
    navigation.navigate('FileDetail', { filePath: file.path });
  };

  // 渲染搜索结果项
  const renderItem = ({ item }: { item: FileItem }) => {
    const { icon, color } = getFileIcon(item.name, item.isDirectory);
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => openFile(item)}
        activeOpacity={0.6}
      >
        <Icon name={icon} size={32} color={color} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.resultPath} numberOfLines={1}>{item.path}</Text>
          <Text style={styles.resultMeta}>
            {formatFileSize(item.size)} · {formatDate(item.mtime)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染分组头
  const renderSectionHeader = ({ section }: { section: SearchSection }) => (
    <View style={styles.sectionHeader}>
      <Icon name={section.icon} size={18} color={section.color} />
      <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
    </View>
  );

  // 总结果数
  const totalResults = results.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <View style={styles.container}>
      {/* 搜索框 */}
      <View style={styles.searchBar}>
        <Icon name="search" size={22} color={Colors.light.textHint} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => doSearch(query)}
          placeholder="搜索文件名..."
          placeholderTextColor={Colors.light.textHint}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Icon name="close" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 搜索中 */}
      {searching && (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      )}

      {/* 搜索结果 */}
      {!searching && searched && results.length > 0 && (
        <>
          <Text style={styles.resultCount}>找到 {totalResults} 个结果</Text>
          <SectionList
            sections={results}
            keyExtractor={(item) => item.path}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled
          />
        </>
      )}

      {/* 无结果 */}
      {!searching && searched && results.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="search-off" size={64} color={Colors.light.textHint} />
          <Text style={styles.emptyText}>未找到匹配文件</Text>
          <Text style={styles.emptyHint}>试试其他关键词？</Text>
        </View>
      )}

      {/* 搜索历史 */}
      {!searched && searchHistory.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>🕐 搜索历史</Text>
          {searchHistory.slice(0, 10).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyItem}
              onPress={() => { setQuery(item); doSearch(item); }}
            >
              <Icon name="history" size={18} color={Colors.light.textSecondary} />
              <Text style={styles.historyText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 初始状态 */}
      {!searched && searchHistory.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="search" size={64} color={Colors.light.textHint} />
          <Text style={styles.emptyText}>搜索文件</Text>
          <Text style={styles.emptyHint}>输入文件名开始搜索</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },

  // 搜索框
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.light.text,
  },

  // 结果统计
  resultCount: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  // 分组头
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },

  // 结果项
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
  },
  resultInfo: { flex: 1, marginLeft: Spacing.md },
  resultName: { fontSize: FontSize.md, color: Colors.light.text, fontWeight: '500' },
  resultPath: { fontSize: FontSize.xs, color: Colors.light.textHint, marginTop: 2 },
  resultMeta: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 2 },

  // 加载状态
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: FontSize.md, color: Colors.light.textSecondary, marginTop: Spacing.md },

  // 空状态
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: FontSize.lg, color: Colors.light.textHint, marginTop: Spacing.md },
  emptyHint: { fontSize: FontSize.sm, color: Colors.light.textHint, marginTop: Spacing.xs },

  // 搜索历史
  historySection: { paddingHorizontal: Spacing.lg },
  historyTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.light.text, marginBottom: Spacing.sm },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
  },
  historyText: { fontSize: FontSize.md, color: Colors.light.textSecondary, marginLeft: Spacing.sm },
});
