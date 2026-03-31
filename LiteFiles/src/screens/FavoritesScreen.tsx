// 收藏夹页面
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useFileStore } from '../hooks/useFileStore';

export default function FavoritesScreen({ navigation }: any) {
  const { favorites, removeFavorite, pushPath } = useFileStore();

  const openFolder = (path: string) => {
    pushPath(path);
    navigation.navigate('浏览');
  };

  const getFolderName = (path: string): string => {
    return path.substring(path.lastIndexOf('/') + 1) || '根目录';
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="star-border" size={80} color={Colors.light.textHint} />
        <Text style={styles.emptyTitle}>暂无收藏</Text>
        <Text style={styles.emptyHint}>长按文件夹可以添加到收藏</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.favoriteItem}
            onPress={() => openFolder(item)}
            activeOpacity={0.6}
          >
            <Icon name="folder" size={40} color="#FFC107" />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{getFolderName(item)}</Text>
              <Text style={styles.itemPath} numberOfLines={1}>{item}</Text>
            </View>
            <TouchableOpacity
              onPress={() => removeFavorite(item)}
              style={styles.removeButton}
            >
              <Icon name="star" size={24} color={Colors.accent} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    color: Colors.light.textHint,
    marginTop: Spacing.lg,
  },
  emptyHint: {
    fontSize: FontSize.sm,
    color: Colors.light.textHint,
    marginTop: Spacing.sm,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
  },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemName: { fontSize: FontSize.lg, color: Colors.light.text, fontWeight: '500' },
  itemPath: { fontSize: FontSize.xs, color: Colors.light.textHint, marginTop: 4 },
  removeButton: { padding: Spacing.sm },
});
