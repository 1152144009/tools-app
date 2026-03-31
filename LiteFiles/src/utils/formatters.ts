import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
};
export const formatRelativeTime = (date: Date): string => dayjs(date).fromNow();
export const formatDateTime = (date: Date): string => dayjs(date).format('YYYY-MM-DD HH:mm:ss');
export const formatDate = (date: Date): string => {
  const d = dayjs(date), now = dayjs();
  if (d.isSame(now, 'day')) return '今天 ' + d.format('HH:mm');
  if (d.isSame(now.subtract(1, 'day'), 'day')) return '昨天 ' + d.format('HH:mm');
  if (d.isSame(now, 'year')) return d.format('M月D日');
  return d.format('YYYY/M/D');
};
export const formatStorage = (used: number, total: number): string =>
  `已用 ${formatFileSize(used)} / 共 ${formatFileSize(total)}`;
