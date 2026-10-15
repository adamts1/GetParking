import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, useReportSheetHeight } from '../../../components/ui';
import { SessionKind } from '../../../lib/session';
import { colors, sharedStyles } from '../../../theme';
import { styles } from './IdleActions.styles';

type Props = {
  canStart: boolean;
  /** Which of the two is being started, for its spinner. */
  starting: SessionKind | null;
  onSearch: () => void;
  onLeave: () => void;
};

/** The two ways to begin. Both need a car and a position. */
export function IdleActions({ canStart, starting, onSearch, onLeave }: Props) {
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();
  const onLayout = useReportSheetHeight();
  const busy = starting != null;

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 16 }]} onLayout={onLayout}>
      <Button
        label={translate('home.search')}
        color={colors.primary}
        large
        style={sharedStyles.fill}
        disabled={!canStart || (busy && starting !== SessionKind.Search)}
        loading={starting === SessionKind.Search}
        onPress={onSearch}
      />
      <Button
        label={translate('home.leave')}
        color={colors.success}
        large
        style={sharedStyles.fill}
        disabled={!canStart || (busy && starting !== SessionKind.Leave)}
        loading={starting === SessionKind.Leave}
        onPress={onLeave}
      />
    </View>
  );
}
