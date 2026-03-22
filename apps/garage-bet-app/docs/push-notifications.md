# Push notifications (Expo)

## What’s implemented

- **`expo-notifications`** + **`expo-device`**: permissions, Expo push token, Android notification channel `default`, foreground presentation.
- **`utils/push-notifications.ts`**: handler registration (imported from `index.js`), `getExpoPushTokenOrNull()`, Android channel setup.
- **`ExpoPushTokenSync`**: after a successful `/me`, posts `{ deviceId, expoPushToken }` to **`POST /api/me/push-token`** (only when the token or device id changes; signature stored in Secure Store).
- **API**: `UserDevice.expoPushToken` + `expoPushTokenUpdatedAt`; token is tied to the same `deviceId` used at login/register.

## What you still need for production

1. **EAS / credentials**
   - iOS: APNs key or certificates in [EAS credentials](https://docs.expo.dev/app-signing/app-credentials/).
   - Android: FCM via `google-services.json` in the project and [Expo’s FCM setup](https://docs.expo.dev/push-notifications/push-notifications-setup/).

2. **Rebuild native apps** after adding the plugin:

   ```bash
   npx expo prebuild --clean
   # or EAS Build
   ```

3. **Physical device**: push tokens are not available on iOS Simulator / most Android emulators.

4. **Sending pushes**: use [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/) with the stored `expoPushToken` values from the database.

## Payload tips

- Android: use channel id **`default`** (see `ANDROID_DEFAULT_NOTIFICATION_CHANNEL_ID` in `utils/push-notifications.ts`) if you set `android.channelId` in the Expo push message.
