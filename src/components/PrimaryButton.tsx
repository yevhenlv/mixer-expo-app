import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';

type PrimaryButtonProps = {
  title: string;
  disabled?: boolean;
  onPress: () => void | Promise<void>;
};

export function PrimaryButton({ title, disabled, onPress }: PrimaryButtonProps) {
  const handlePress = async () => {
    if (disabled) {
      return;
    }

    try {
      await Haptics.selectionAsync();
    } catch {
      // noop
    }

    await onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D96FF',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: '#0B1430',
    fontSize: 17,
    fontWeight: '700',
  },
});
