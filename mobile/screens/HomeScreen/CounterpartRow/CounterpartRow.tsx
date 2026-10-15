import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Avatar, type IconName } from '../../../components/ui';
import type { Counterpart } from '../../../lib/session';
import { colorHex } from '../../../lib/vehicles';
import { styles } from './CounterpartRow.styles';

type Props = {
  counterpart: Counterpart | null;
  /** "is leaving" / "is on the way". */
  verb: string;
  /** The other driver's side — the avatar's colour. */
  avatarColor: string;
  badge: IconName;
};

/** Who the other driver is and what to look for in the street: colour, car,
    and the plate's last digits. Both match sheets show this row. */
export function CounterpartRow({ counterpart, verb, avatarColor, badge }: Props) {
  const { t: translate } = useTranslation();
  const name = counterpart?.nickname || translate('matched.unknownDriver');
  const carText = counterpart
    ? [
        translate(`vehicle.colors.${counterpart.color}`, { defaultValue: counterpart.color }),
        counterpart.make_model,
        translate('vehicle.plateShort', { digits: counterpart.plate_last_digits }),
      ].join(' · ')
    : '';

  return (
    <View style={styles.row}>
      <Avatar letter={name[0] ?? '?'} color={avatarColor} badge={badge} />
      <View style={styles.identity}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
          <Text style={styles.verb}> {verb}</Text>
        </Text>
        {counterpart ? (
          <View style={styles.car}>
            <View style={[styles.swatch, { backgroundColor: colorHex(counterpart.color) }]} />
            <Text style={styles.carText} numberOfLines={1}>
              {carText}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
