import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, sharedStyles } from '../../../theme';
import { Icon, type IconName } from '../Icons';
import { styles } from './Field.styles';

type Props = TextInputProps & {
  label?: string;
  icon?: IconName;
  /** Explains the field while it is valid; an error replaces it. */
  hint?: string;
  error?: string | null;
};

/** A labelled text input in a glass box. */
export const Field = forwardRef<TextInput, Props>(function Field(
  { label, icon, hint, error, style, ...props },
  ref,
) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={sharedStyles.label}>{label}</Text> : null}
      <View style={[styles.box, error ? styles.invalid : null]}>
        {icon ? <Icon name={icon} size={18} color={colors.textTertiary} /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          accessibilityLabel={label}
          style={[styles.input, style]}
          {...props}
        />
      </View>
      {error ? (
        <Text style={[sharedStyles.caption, styles.note, styles.error]}>{error}</Text>
      ) : hint ? (
        <Text style={[sharedStyles.caption, styles.note]}>{hint}</Text>
      ) : null}
    </View>
  );
});
