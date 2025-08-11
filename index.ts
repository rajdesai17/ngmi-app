import { registerRootComponent } from 'expo'
import App from './App'

// Ensure env is loaded in dev for Expo Go
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('react-native-url-polyfill/auto')

registerRootComponent(App)
