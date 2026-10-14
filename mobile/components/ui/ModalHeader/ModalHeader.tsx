import { Text, View } from 'react-native';
import { sharedStyles } from '../../../theme';
import { IconName } from '../Icons';
import { IconButton } from '../IconButton';
import { styles } from './ModalHeader.styles';

type Props = { title: string; onClose: () => void; closeLabel: string };

/** Centred title with a close button — the top of a presented modal. */
export function ModalHeader({ title, onClose, closeLabel }: Props) {
  return (
    <View style={styles.header}>
      <IconButton icon={IconName.Close} label={closeLabel} onPress={onClose} />
      <Text style={[sharedStyles.h2, styles.title]}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}
