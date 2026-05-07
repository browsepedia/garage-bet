const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAdiRegistration(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const assetsDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/assets',
      );

      const srcFile = path.join(
        config.modRequest.projectRoot,
        'assets/adi-registration.properties',
      );

      console.log(
        '[withAdiRegistration] projectRoot:',
        config.modRequest.projectRoot,
      );
      console.log(
        '[withAdiRegistration] platformProjectRoot:',
        config.modRequest.platformProjectRoot,
      );
      console.log('[withAdiRegistration] srcFile:', srcFile);
      console.log(
        '[withAdiRegistration] srcFile exists:',
        fs.existsSync(srcFile),
      );
      console.log('[withAdiRegistration] assetsDir:', assetsDir);

      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      fs.copyFileSync(
        srcFile,
        path.join(assetsDir, 'adi-registration.properties'),
      );

      console.log('[withAdiRegistration] file copied successfully');

      return config;
    },
  ]);
};
