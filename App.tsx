import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

import { MixingScreen } from './src/screens/MixingScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { Text1Screen } from './src/screens/Text1Screen';
import { Text2Screen } from './src/screens/Text2Screen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0A1020',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Text1"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: '#0A1020' },
        }}
      >
        <Stack.Screen name="Text1" component={Text1Screen} />
        <Stack.Screen name="Text2" component={Text2Screen} />
        <Stack.Screen
          name="Mixing"
          component={MixingScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
