import { StyleSheet } from 'react-native';

/** The artwork is a rounded blue tile with transparent corners. It carries
    its own shape and contrast, and no shadow: iOS draws a shadow from the
    image's bounding box, which shows up as a dark square behind the corners. */
export const styles = StyleSheet.create({
  mark: { alignSelf: 'center' },
});
