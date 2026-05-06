import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';

export default function Reflection({ navigation }: RootStackScreenProps<'Reflection'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reflection</Text>
      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
        }
      >
        <Text style={styles.buttonText}>New Game</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  heading: { fontSize: 24, marginBottom: 24 },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderRadius: 8 },
  buttonText: { fontSize: 16 },
});
