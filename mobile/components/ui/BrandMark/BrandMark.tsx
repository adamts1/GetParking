import { Image } from 'react-native';
import { styles } from './BrandMark.styles';

/** The app's logo: the P of two parking pins over the Tel Aviv shoreline.
    Same file as the launcher icon and the splash screen, so the three read
    as one image while the app opens. */
export function BrandMark({ size = 112, label }: { size?: number; label?: string }) {
  return (
    <Image
      source={require('../../../assets/logo.png')}
      style={[styles.mark, { width: size, height: size }]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel={label}
    />
  );
}
