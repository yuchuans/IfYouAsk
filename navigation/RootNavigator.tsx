import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CategorySelection from '../screens/CategorySelection';
import FirstPlayerSelection from '../screens/FirstPlayerSelection';
import NameEntry from '../screens/NameEntry';
import QuestionCard from '../screens/QuestionCard';
import Reflection from '../screens/Reflection';
import Welcome from '../screens/Welcome';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NameEntry"
        component={NameEntry}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="FirstPlayerSelection"
        component={FirstPlayerSelection}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="CategorySelection"
        component={CategorySelection}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="QuestionCard"
        component={QuestionCard}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Reflection"
        component={Reflection}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
