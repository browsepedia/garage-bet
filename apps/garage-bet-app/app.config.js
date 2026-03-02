const path = require('path');
const { expo } = require('./app.json');

const iconPath = path.join(__dirname, 'assets/images/icon.png');

module.exports = {
  expo: {
    ...expo,
    icon: iconPath,
    android: {
      ...expo.android,
      adaptiveIcon: {
        ...expo.android.adaptiveIcon,
        foregroundImage: iconPath,
      },
    },
  },
};
