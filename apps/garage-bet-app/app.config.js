const path = require('path');
const { expo } = require('./app.json');

const iconPath = path.join(__dirname, 'assets/images/icon.png');
const scheme = typeof expo.scheme === 'string' ? expo.scheme : 'garage-bet-app';
const defaultAppDeepLinkBase = `${scheme}:///`;

module.exports = {
  expo: {
    ...expo,
    icon: iconPath,
    extra: {
      ...expo.extra,
      /** Same meaning as API `APP_DEEP_LINK_URL` (browser redirect after email verify). */
      appDeepLinkBaseUrl:
        process.env.EXPO_PUBLIC_APP_DEEP_LINK_URL?.trim() ||
        defaultAppDeepLinkBase,
    },
    android: {
      ...expo.android,
      adaptiveIcon: {
        ...expo.android.adaptiveIcon,
        foregroundImage: iconPath,
      },
    },
  },
};
