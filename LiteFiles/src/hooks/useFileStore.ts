// 全局状态管理 - Zustand Store
import { create } from 'zustand';
import { FileItem } from '../services/FileService';

export type SortBy = 'name' | 'size' | 'date' | 'type';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ClipboardItem {
  files: FileItem[];
  operation: 'copy' | 'cut';
}

interface FileStore {
  // 当前路径
  currentPath: string;
  setCurrentPath: (path: string) => void;

  // 路径历史（面包屑）
  pathHistory: string[];
  pushPath: (path: string) => void;
  popPath: () => string | null;

  // 视图模式
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // 排序
  sortBy: SortBy;
  sortOrder: SortOrder;
  setSortBy: (by: SortBy) => void;
  toggleSortOrder: () => void;

  // 主题
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // 显示隐藏文件
  showHidden: boolean;
  toggleShowHidden: () => void;

  // 多选模式
  isSelecting: boolean;
  selectedFiles: FileItem[];
  setSelecting: (selecting: boolean) => void;
  toggleFileSelection: (file: FileItem) => void;
  selectAll: (files: FileItem[]) => void;
  clearSelection: () => void;

  // 剪贴板
  clipboard: ClipboardItem | null;
  setClipboard: (clipboard: ClipboardItem | null) => void;

  // 收藏夹
  favorites: string[];
  addFavorite: (path: string) => void;
  removeFavorite: (path: string) => void;
  isFavorite: (path: string) => boolean;

  // 搜索
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;

  // 最近文件
  recentFiles: FileItem[];
  addRecentFile: (file: FileItem) => void;
}

export const useFileStore = create<FileStore>((set, get) => ({
  // 当前路径
  currentPath: '',
  setCurrentPath: (path) => set({ currentPath: path }),

  // 路径历史
  pathHistory: [],
  pushPath: (path) => set(state => ({
    pathHistory: [...state.pathHistory, state.currentPath],
    currentPath: path,
  })),
  popPath: () => {
    const { pathHistory } = get();
    if (pathHistory.length === 0) return null;
    const prevPath = pathHistory[pathHistory.length - 1];
    set({ pathHistory: pathHistory.slice(0, -1), currentPath: prevPath });
    return prevPath;
  },

  // 视图模式
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),

  // 排序
  sortBy: 'name',
  sortOrder: 'asc',
  setSortBy: (by) => set({ sortBy: by }),
  toggleSortOrder: () => set(state => ({
    sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
  })),

  // 主题
  themeMode: 'system',
  setThemeMode: (mode) => set({ themeMode: mode }),

  // 显示隐藏文件
  showHidden: false,
  toggleShowHidden: () => set(state => ({ showHidden: !state.showHidden })),

  // 多选模式
  isSelecting: false,
  selectedFiles: [],
  setSelecting: (selecting) => set({
    isSelecting: selecting,
    selectedFiles: selecting ? get().selectedFiles : [],
  }),
  toggleFileSelection: (file) => set(state => {
    const index = state.selectedFiles.findIndex(f => f.path === file.path);
    if (index >= 0) {
      return { selectedFiles: state.selectedFiles.filter(f => f.path !== file.path) };
    }
    return { selectedFiles: [...state.selectedFiles, file] };
  }),
  selectAll: (files) => set({ selectedFiles: [...files] }),
  clearSelection: () => set({ isSelecting: false, selectedFiles: [] }),

  // 剪贴板
  clipboard: null,
  setClipboard: (clipboard) => set({ clipboard }),

  // 收藏夹
  favorites: [],
  addFavorite: (path) => set(state => ({
    favorites: [...state.favorites, path],
  })),
  removeFavorite: (path) => set(state => ({
    favorites: state.favorites.filter(f => f !== path),
  })),
  isFavorite: (path) => get().favorites.includes(path),

  // 搜索
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchHistory: [],
  addSearchHistory: (query) => set(state => ({
    searchHistory: [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 20),
  })),

  // 最近文件
  recentFiles: [],
  addRecentFile: (file) => set(state => ({
    recentFiles: [file, ...state.recentFiles.filter(f => f.path !== file.path)].slice(0, 50),
  })),
}));