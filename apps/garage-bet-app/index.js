// Must be first - required by react-native-gesture-handler
import 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import 'expo-router/entry';

// Keep splash visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();