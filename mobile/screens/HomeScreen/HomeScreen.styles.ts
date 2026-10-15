import { StyleSheet } from 'react-native';
import { colors, radius, SPACE } from '../../theme';

export const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, start: 0, end: 0, paddingHorizontal: SPACE.lg, gap: SPACE.sm },
  bar: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  vehicle: { flex: 1 },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm + 2,
    borderRadius: radius.md,
  },
  credits: { color: colors.success, fontSize: 13, fontWeight: '700' },
  notice: { padding: SPACE.lg, gap: SPACE.sm },
  bottom: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    end: 0,
    flexDirection: 'row',
    gap: SPACE.md,
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.lg,
  },
});
