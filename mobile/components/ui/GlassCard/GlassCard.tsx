import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from './GlassCard.styles';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Overrides the hairline border — used to tint a card with a flow's accent. */
  borderColor?: string;
};

/** The frosted panel every overlay in the app is built on. The blur is iOS
    only; on Android the translucent fill alone reads correctly. */
export function GlassCard({ children, style, borderColor }: Props) {
  return (
    <View style={[styles.card, borderColor ? { borderColor } : null, style]}>
      {Platform.OS === 'ios' && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
      {children}
    </View>
  );
}
