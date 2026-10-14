import { Text, View } from 'react-native';
import { alpha, C, start, type Accent } from '../../../theme';
import { Icon, type IconName } from '../Icons';
import { styles } from './InfoStrip.styles';

type Props = {
  accent: Accent;
  /** Either an icon or a single letter (the amber "P"). */
  icon?: IconName;
  letter?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
};

/** A tinted strip: the spot, the address, what it is worth. */
export function InfoStrip({ accent, icon, letter, title, subtitle, trailing }: Props) {
  return (
    <View style={[styles.strip, { backgroundColor: accent.wash, borderColor: accent.line }]}>
      <View style={[styles.badge, { backgroundColor: alpha(accent.main, 0.15) }]}>
        {icon ? (
          <Icon name={icon} size={16} color={accent.main} />
        ) : (
          <Text style={[styles.letter, { color: accent.main }]}>{letter}</Text>
        )}
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

/** The "+1 credit" that sits at the end of a leaver's spot strip. */
export function StripNote({ text, color }: { text: string; color: string }) {
  return <Text style={[styles.note, { color }]}>{text}</Text>;
}

