/**
 * Metro configuration for React Native
 * https://metro.dev/docs/configuration
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Add any custom resolver configurations here
    assetExts: [...defaultConfig.resolver.assetExts, 'ttf', 'otf'],
    sourceExts: [...defaultConfig.resolver.sourceExts, 'ts', 'tsx'],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
};

module.exports = mergeConfig(defaultConfig, config);