import { Text, View } from 'react-native';
import { styles } from './ParkingPin.styles';

/** The spot being handed over. Both pieces are positioned absolutely so the
    point stays exactly where PIN_ANCHOR says it is. */
export function ParkingPin() {
  return (
    <View style={styles.wrap}>
      <View style={styles.shadow} />
      <View style={styles.pin}>
        <Text style={styles.letter}>P</Text>
      </View>
    </View>
  );
}
