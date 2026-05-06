import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';

export default function FirstPlayerSelection({
  navigation,
}: RootStackScreenProps<'FirstPlayerSelection'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>First Player Selection</Text>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('CategorySelection')}
      >
        <Text style={styles.buttonText}>Continue</Text>
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
