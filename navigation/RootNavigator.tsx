import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';

import CategorySelection from '../screens/CategorySelection';
import DesignSystemTest from '../screens/DesignSystemTest';
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
        options={({ navigation }) => ({
          title: 'Pick a Category',
          headerBackVisible: false,
          gestureEnabled: false,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('Reflection')}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="End session"
            >
              <Text style={{ fontSize: 18 }}>✕</Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="QuestionCard"
        component={QuestionCard}
        options={{ title: 'Question' }}
      />
      <Stack.Screen
        name="Reflection"
        component={Reflection}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DesignSystemTest"
        component={DesignSystemTest}
        options={{ title: 'Design System' }}
      />
    </Stack.Navigator>
  );
}
