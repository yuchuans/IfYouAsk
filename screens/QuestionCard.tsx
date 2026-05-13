import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';

// TODO: Phase 4 — accept { player1, player2, askingPlayer, round, category }
// from CategorySelection, render the actual question, and on Next Round
// navigate('CategorySelection', { ...params, round: round + 1, askingPlayer: askingPlayer === 1 ? 2 : 1 }).
export default function QuestionCard({ navigation }: RootStackScreenProps<'QuestionCard'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Question Card</Text>
      <Pressable style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Next Round</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  heading: { fontSize: 24, marginBottom: 24 },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderRadius: 8 },
  buttonText: { fontSize: 16 },
});
