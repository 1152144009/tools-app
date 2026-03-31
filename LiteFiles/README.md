# 📱 LiteFiles - 轻量文件管理器

> Less is More. Files Made Simple.

一款简洁、高效、无广告的移动端文件管理器。

## ✨ 特性

- 🚫 **零广告** - 永远不会有广告
- ⚡ **秒开** - 极速启动，流畅操作
- 🎨 **Material Design** - 现代美观的界面设计
- 📱 **单手操作** - 底部导航，操作区域在下半屏
- 🔒 **隐私保护** - 最小权限，不收集数据
- 🌙 **深色模式** - 原生深色主题支持

## 🛠️ 技术栈

- **React Native** 0.73
- **TypeScript**
- **React Navigation** 6
- **Zustand** 状态管理
- **react-native-fs** 文件操作
- **react-native-vector-icons** 图标

## 📁 项目结构

```
src/
├── App.tsx                 # 入口组件
├── navigation/             # 路由导航
├── screens/                # 页面组件
│   ├── HomeScreen.tsx      # 智能首页
│   ├── BrowserScreen.tsx   # 文件浏览器
│   ├── SearchScreen.tsx    # 全局搜索
│   ├── FavoritesScreen.tsx # 收藏夹
│   ├── SettingsScreen.tsx  # 设置
│   ├── CategoryScreen.tsx  # 分类浏览
│   └── FileDetailScreen.tsx # 文件详情
├── services/               # 服务层
│   └── FileService.ts      # 文件操作服务
├── hooks/                  # Hooks
│   └── useFileStore.ts     # 全局状态
├── constants/              # 常量
│   ├── theme.ts            # 主题配置
│   └── fileTypes.ts        # 文件类型
└── utils/                  # 工具函数
    └── formatters.ts       # 格式化
```

## 🚀 开发

```bash
# 安装依赖
npm install

# 启动 Metro
npm start

# 运行 Android
npm run android

# 运行 iOS
npm run ios
```

## 📄 License

MIT
