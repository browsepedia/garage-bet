const { withAndroidBuildGradle } = require('@expo/config-plugins');

// Pins AGP to a known-compatible version. Without this, the unversioned
// classpath('com.android.tools.build:gradle') resolves to the latest AGP,
// which can be too new for native modules (gesture-handler, screens, svg, etc.).
module.exports = function withPinnedAgp(config) {
  return withAndroidBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      "classpath('com.android.tools.build:gradle')",
      "classpath('com.android.tools.build:gradle:8.7.3')"
    );
    return config;
  });
};
