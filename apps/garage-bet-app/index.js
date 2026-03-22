// Must be first - required by react-native-gesture-handler
import 'react-native-gesture-handler';
// Registers foreground notification behavior (expo-notifications)
import './utils/push-notifications';
import * as SplashScreen from 'expo-splash-screen';
import 'expo-router/entry';

// Keep splash visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();