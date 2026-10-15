import { I18nManager, StyleSheet } from 'react-native';
import { radius } from '../../../theme';

/* Apple's logo and legal link sit bottom-left whatever the language, so the
   locate button takes the physical right. React Native mirrors left/right in
   RTL, which is why this picks the logical side that lands on the right. */
const physicalRight = I18nManager.isRTL ? { start: 16 } : { end: 16 };

export const styles = StyleSheet.create({
  locate: { position: 'absolute', zIndex: 40, ...physicalRight },
  locateCard: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
