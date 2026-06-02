const { withProjectBuildGradle } = require('@expo/config-plugins');

// Pins AGP to the version expected by @react-native/gradle-plugin
// (see node_modules/@react-native/gradle-plugin/gradle/libs.versions.toml).
// Without a version, classpath('com.android.tools.build:gradle') resolves to
// the latest AGP; pinning keeps it aligned with what RNGP itself runs against.
module.exports = function withPinnedAgp(config) {
  return withProjectBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      "classpath('com.android.tools.build:gradle')",
      "classpath('com.android.tools.build:gradle:8.11.0')",
    );
    return config;
  });
};
