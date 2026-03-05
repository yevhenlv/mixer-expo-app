import { StyleSheet, Text, View } from 'react-native';

type TextPillProps = {
  label: string;
  text: string;
};

export function TextPill({ label, text }: TextPillProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.text} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4A5D96',
    backgroundColor: 'rgba(26, 39, 77, 0.85)',
    alignSelf: 'flex-start',
    width: '100%',
  },
  label: {
    color: '#B9C8F0',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  text: {
    color: '#E8EFFF',
    fontSize: 13,
    lineHeight: 17,
  },
});
