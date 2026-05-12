import { NativeWindStyleSheet } from 'nativewind';
import { Slot } from 'expo-router';

// Required to enable NativeWind styles in the app
NativeWindStyleSheet.setOutput({ default: 'native' });

export default function App() {
  // Slot renders whichever screen file Expo Router matches
  // (e.g., app/_layout.js, app/index.js, app/cart.js, etc.)
  return <Slot />;
}