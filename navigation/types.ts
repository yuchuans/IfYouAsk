import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CategoryId } from '../src/data/questions';

// Game-session state (player names, asker, round, used questions) lives in
// GameContext (src/context/GameContext.tsx), not in nav params. Routes only
// carry data that's specific to the *next screen instance* — e.g., which
// category card the user tapped on the way into QuestionCard. Everything
// else screens need is read via useGame().
export type RootStackParamList = {
  Welcome: undefined;
  NameEntry: undefined;
  FirstPlayerSelection: undefined;
  CategorySelection: undefined;
  QuestionCard: {
    /** Which category card the player chose on CategorySelection. */
    category: CategoryId;
  };
  Reflection: undefined;
  DesignSystemTest: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
