import { Text, View } from 'react-native';
import { s } from '../../../theme';
import { IconButton } from '../IconButton';
import { styles } from './ModalHeader.styles';

type Props = { title: string; onClose: () => void; closeLabel: string };

/** Centred title with a close button — the top of a presented modal. */
export function ModalHeader({ title, onClose, closeLabel }: Props) {
  return (
    <View style={styles.header}>
      <IconButton icon="close" label={closeLabel} onPress={onClose} />
      <Text style={[s.h2, styles.title]}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}
