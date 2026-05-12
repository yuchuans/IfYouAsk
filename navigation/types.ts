import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  NameEntry: undefined;
  FirstPlayerSelection: { player1: string; player2: string };
  CategorySelection: undefined;
  QuestionCard: undefined;
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
