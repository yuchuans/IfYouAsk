import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';

export default function Welcome({ navigation }: RootStackScreenProps<'Welcome'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('NameEntry')}>
        <Text style={styles.buttonText}>Start</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('DesignSystemTest')}
      >
        <Text style={styles.buttonText}>Design System</Text>
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
