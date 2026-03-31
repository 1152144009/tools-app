// 文件操作服务层
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { getFileCategory } from '../constants/fileTypes';

export interface FileItem {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  mtime: Date;
  ctime: Date;
  isHidden: boolean;
  extension: string;
  category: string | null;
}

export interface StorageInfo {
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  usedPercentage: number;
}

class FileService {
  // 获取根目录路径
  getRootPath(): string {
    return Platform.OS === 'android'
      ? RNFS.ExternalStorageDirectoryPath
      : RNFS.DocumentDirectoryPath;
  }

  // 读取目录内容
  async listDirectory(path: string, showHidden: boolean = false): Promise<FileItem[]> {
    try {
      const items = await RNFS.readDir(path);
      const fileItems: FileItem[] = items
        .filter(item => showHidden || !item.name.startsWith('.'))
        .map(item => ({
          name: item.name,
          path: item.path,
          size: item.size || 0,
          isDirectory: item.isDirectory(),
          mtime: new Date(item.mtime || 0),
          ctime: new Date(item.ctime || 0),
          isHidden: item.name.startsWith('.'),
          extension: item.name.includes('.') ? item.name.substring(item.name.lastIndexOf('.')) : '',
          category: item.isDirectory() ? 'folder' : (getFileCategory(item.name)?.id || 'other'),
        }));

      // 默认排序：文件夹在前，按名称排序
      return fileItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('读取目录失败:', error);
      return [];
    }
  }

  // 获取存储空间信息
  async getStorageInfo(): Promise<StorageInfo> {
    try {
      const free = await RNFS.getFSInfo();
      const totalSpace = free.totalSpace || 0;
      const freeSpace = free.freeSpace || 0;
      const usedSpace = totalSpace - freeSpace;
      return {
        totalSpace,
        freeSpace,
        usedSpace,
        usedPercentage: totalSpace > 0 ? (usedSpace / totalSpace) * 100 : 0,
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return { totalSpace: 0, freeSpace: 0, usedSpace: 0, usedPercentage: 0 };
    }
  }

  // 复制文件
  async copyFile(sourcePath: string, destPath: string): Promise<boolean> {
    try {
      await RNFS.copyFile(sourcePath, destPath);
      return true;
    } catch (error) {
      console.error('复制文件失败:', error);
      return false;
    }
  }

  // 移动文件
  async moveFile(sourcePath: string, destPath: string): Promise<boolean> {
    try {
      await RNFS.moveFile(sourcePath, destPath);
      return true;
    } catch (error) {
      console.error('移动文件失败:', error);
      return false;
    }
  }

  // 删除文件/文件夹
  async deleteFile(path: string): Promise<boolean> {
    try {
      const exists = await RNFS.exists(path);
      if (!exists) return false;

      const stat = await RNFS.stat(path);
      if (stat.isDirectory()) {
        await RNFS.unlink(path);
      } else {
        await RNFS.unlink(path);
      }
      return true;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  // 重命名文件
  async renameFile(oldPath: string, newName: string): Promise<boolean> {
    try {
      const dir = oldPath.substring(0, oldPath.lastIndexOf('/'));
      const newPath = `${dir}/${newName}`;
      await RNFS.moveFile(oldPath, newPath);
      return true;
    } catch (error) {
      console.error('重命名失败:', error);
      return false;
    }
  }

  // 新建文件夹
  async createDirectory(path: string): Promise<boolean> {
    try {
      await RNFS.mkdir(path);
      return true;
    } catch (error) {
      console.error('创建文件夹失败:', error);
      return false;
    }
  }

  // 搜索文件
  async searchFiles(rootPath: string, query: string, maxResults: number = 100): Promise<FileItem[]> {
    const results: FileItem[] = [];
    const lowerQuery = query.toLowerCase();

    const search = async (dirPath: string) => {
      if (results.length >= maxResults) return;
      try {
        const items = await RNFS.readDir(dirPath);
        for (const item of items) {
          if (results.length >= maxResults) break;
          if (item.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              name: item.name,
              path: item.path,
              size: item.size || 0,
              isDirectory: item.isDirectory(),
              mtime: new Date(item.mtime || 0),
              ctime: new Date(item.ctime || 0),
              isHidden: item.name.startsWith('.'),
              extension: item.name.includes('.') ? item.name.substring(item.name.lastIndexOf('.')) : '',
              category: item.isDirectory() ? 'folder' : (getFileCategory(item.name)?.id || 'other'),
            });
          }
          if (item.isDirectory() && !item.name.startsWith('.')) {
            await search(item.path);
          }
        }
      } catch (_) {
        // 跳过无权限目录
      }
    };

    await search(rootPath);
    return results;
  }

  // 获取文件详情
  async getFileInfo(path: string): Promise<FileItem | null> {
    try {
      const stat = await RNFS.stat(path);
      const name = path.substring(path.lastIndexOf('/') + 1);
      return {
        name,
        path,
        size: stat.size || 0,
        isDirectory: stat.isDirectory(),
        mtime: new Date(stat.mtime || 0),
        ctime: new Date(stat.ctime || 0),
        isHidden: name.startsWith('.'),
        extension: name.includes('.') ? name.substring(name.lastIndexOf('.')) : '',
        category: stat.isDirectory() ? 'folder' : (getFileCategory(name)?.id || 'other'),
      };
    } catch (error) {
      console.error('获取文件信息失败:', error);
      return null;
    }
  }

  // 格式化文件大小
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
  }

  // 按分类获取文件
  async getFilesByCategory(rootPath: string, categoryId: string): Promise<FileItem[]> {
    const results: FileItem[] = [];

    const scan = async (dirPath: string) => {
      try {
        const items = await RNFS.readDir(dirPath);
        for (const item of items) {
          if (!item.isDirectory()) {
            const cat = getFileCategory(item.name);
            if (cat && cat.id === categoryId) {
              results.push({
                name: item.name,
                path: item.path,
                size: item.size || 0,
                isDirectory: false,
                mtime: new Date(item.mtime || 0),
                ctime: new Date(item.ctime || 0),
                isHidden: item.name.startsWith('.'),
                extension: item.name.substring(item.name.lastIndexOf('.')),
                category: categoryId,
              });
            }
          } else if (!item.name.startsWith('.')) {
            await scan(item.path);
          }
        }
      } catch (_) {}
    };

    await scan(rootPath);
    return results.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  }
}

export default new FileService();