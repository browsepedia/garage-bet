const { withNxMetro } = require('@nx/expo');
const { getDefaultConfig } = require('@expo/metro-config');
const { mergeConfig } = require('metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Do not set babelTransformerPath to react-native-svg-transformer here: in a Yarn
 * workspace it can pull @react-native/babel-plugin-codegen from the repo root while
 * Babel runs from the app tree, which breaks RN codegen on .ts specs (e.g. gesture-handler).
 * If you need SVG-as-components later, add a transformer that only runs for *.svg.
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  cacheVersion: 'garage-bet-app',
};

module.exports = withNxMetro(mergeConfig(defaultConfig, customConfig), {
  debug: false,
  extensions: [],
  watchFolders: [],
});
