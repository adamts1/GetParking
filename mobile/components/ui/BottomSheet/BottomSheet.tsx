import { createContext, useContext, useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SHEET_INSET } from '../../../theme';
import { GlassCard } from '../GlassCard';
import { styles } from './BottomSheet.styles';

/* How much of the screen the current sheet covers.

   The map needs the real number, not a guess: it decides where the locate
   button sits and how far the camera is pushed up so the pins clear the
   sheet. The sheets differ in height — a match sheet is half the screen, the
   idle one a fifth — so the sheet measures itself and the map reads it. */
const SheetHeightContext = createContext<{ height: number; report: (h: number) => void }>({
  height: SHEET_INSET.compact,
  report: () => {},
});

export function SheetHeightProvider({ children }: { children: React.ReactNode }) {
  const [height, setHeight] = useState<number>(SHEET_INSET.compact);
  const value = useMemo(() => ({ height, report: setHeight }), [height]);
  return <SheetHeightContext.Provider value={value}>{children}</SheetHeightContext.Provider>;
}

export const useSheetHeight = () => useContext(SheetHeightContext).height;

/** The panel at the bottom of every map screen. It does not drag — the
    content changes with the flow, so there is nothing to expand into. */
export function BottomSheet({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { report } = useContext(SheetHeightContext);

  const onLayout = (e: LayoutChangeEvent) => report(Math.round(e.nativeEvent.layout.height));

  return (
    <View style={styles.wrap} pointerEvents="box-none" onLayout={onLayout}>
      <View style={styles.grabber} />
      <GlassCard style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        {children}
      </GlassCard>
    </View>
  );
}
