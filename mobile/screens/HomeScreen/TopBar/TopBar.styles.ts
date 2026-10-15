import { StyleSheet } from 'react-native';
import { colors, radius, SPACE } from '../../../theme';

export const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, start: 0, end: 0, paddingHorizontal: SPACE.lg, gap: SPACE.sm, zIndex: 50 },
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
  profileCard: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  credits: { color: colors.success, fontSize: 13, fontWeight: '700' },
  notice: { padding: SPACE.lg, gap: SPACE.sm },
});
