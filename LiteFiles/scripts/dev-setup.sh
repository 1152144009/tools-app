#!/bin/bash

# LiteFiles React Native 开发环境设置脚本

echo "🚀 LiteFiles 开发环境设置"
echo "=========================="

# 检查Node.js版本
echo "📊 检查Node.js环境..."
node --version
npm --version

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 检查Android环境
echo "🤖 检查Android环境..."
if command -v adb &> /dev/null; then
    echo "✅ ADB 已安装"
    adb version
else
    echo "⚠️ ADB 未安装，请安装 Android SDK"
fi

# 检查iOS环境 (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 检查iOS环境..."
    if command -v xcodebuild &> /dev/null; then
        echo "✅ Xcode 已安装"
        xcodebuild -version
    else
        echo "⚠️ Xcode 未安装"
    fi
fi

# 创建开发配置
echo "⚙️ 创建开发配置..."

# 创建 .env 文件
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# LiteFiles 开发环境配置
NODE_ENV=development
DEBUG=true

# Android配置
ANDROID_PACKAGE_NAME=com.litefiles.app

# iOS配置
IOS_BUNDLE_IDENTIFIER=com.litefiles.app
EOF
    echo "✅ 创建 .env 文件"
fi

# 创建 gitignore
if [ ! -f .gitignore ]; then
    cat > .gitignore << 'EOF'
# React Native
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Android
android/.gradle/
android/app/build/
android/build/

# iOS
iOS/build/
ios/Pods/

# IDE
.vscode/
.idea/

# Environment
.env.local
.env.development.local
.env.test.local
.env.production.local

# Misc
.DS_Store
*.tgz
*.tar.gz
EOF
    echo "✅ 创建 .gitignore 文件"
fi

echo ""
echo "🎉 开发环境设置完成！"
echo ""
echo "📱 启动开发服务器:"
echo "   npm start"
echo ""
echo "🤖 运行 Android:"
echo "   npm run android"
echo ""
echo "🍎 运行 iOS (macOS):"
echo "   npm run ios"
echo ""
echo "🧪 运行测试:"
echo "   npm test"
echo ""
echo "🔍 代码检查:"
echo "   npm run lint"