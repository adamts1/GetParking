import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { alpha, C, R } from '../../../theme';
import { CAR_COLOR_KEYS, CAR_COLORS, type CarColor } from '../../../lib/vehicles';
import { styles } from './ColorPicker.styles';

type Props = { value: CarColor; onChange: (color: CarColor) => void };

/** The car's colour — the first thing the other driver will look for. */
export function ColorPicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {CAR_COLOR_KEYS.map((key) => {
        const selected = key === value;
        const hex = CAR_COLORS[key];
        return (
          <Pressable
            key={key}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(key)}
            style={[styles.option, selected && { backgroundColor: alpha(hex, 0.15), borderColor: alpha(hex, 0.5) }]}
          >
            <View style={[styles.swatch, { backgroundColor: hex }, key === 'white' && styles.whiteSwatch]} />
            <Text style={[styles.label, selected && styles.selectedLabel]}>{t(`vehicle.colors.${key}`)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

