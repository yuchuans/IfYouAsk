import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  NameEntry: undefined;
  FirstPlayerSelection: { player1: string; player2: string };
  CategorySelection: {
    player1: string;
    player2: string;
    /** Which player asks this round. The other player shares. */
    askingPlayer: 1 | 2;
    /** 1-indexed round number. Increments after each question is viewed (wired in Phase 4). */
    round: number;
  };
  QuestionCard: {
    /** Which category card the player chose on CategorySelection. */
    category: 'justVibing' | 'digDeep' | 'waitWhat';
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
