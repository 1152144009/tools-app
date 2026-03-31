export interface FileCategory {
  id: string; name: string; icon: string; color: string; extensions: string[];
}
export const FILE_CATEGORIES: FileCategory[] = [
  { id: 'image', name: '图片', icon: 'image', color: '#E91E63', extensions: ['.jpg','.jpeg','.png','.gif','.bmp','.webp','.svg','.heic'] },
  { id: 'video', name: '视频', icon: 'videocam', color: '#9C27B0', extensions: ['.mp4','.avi','.mkv','.mov','.wmv','.flv','.webm','.3gp'] },
  { id: 'audio', name: '音频', icon: 'music-note', color: '#FF5722', extensions: ['.mp3','.wav','.flac','.aac','.ogg','.wma','.m4a'] },
  { id: 'document', name: '文档', icon: 'description', color: '#2196F3', extensions: ['.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.txt','.csv','.md'] },
  { id: 'archive', name: '压缩包', icon: 'archive', color: '#795548', extensions: ['.zip','.rar','.7z','.tar','.gz'] },
  { id: 'apk', name: '安装包', icon: 'android', color: '#4CAF50', extensions: ['.apk','.xapk'] },
];
export const getFileCategory = (filename: string): FileCategory | null => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return FILE_CATEGORIES.find(cat => cat.extensions.includes(ext)) || null;
};
export const getFileIcon = (filename: string, isDirectory: boolean): { icon: string; color: string } => {
  if (isDirectory) return { icon: 'folder', color: '#FFC107' };
  const category = getFileCategory(filename);
  return category ? { icon: category.icon, color: category.color } : { icon: 'insert-drive-file', color: '#607D8B' };
};
