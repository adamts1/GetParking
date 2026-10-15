/* "Add your car" — used both right after signup (with the nickname) and from
   My Vehicles. */

import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, Icon, IconName, LinkText, ScreenHeader } from '../../components/ui';
import { alpha, colors, sharedStyles } from '../../theme';
import { CAR_COLORS } from '../../lib/vehicles';
import { ColorPicker } from './ColorPicker';
import { styles } from './VehicleForm.styles';
import { useVehicleForm } from './useVehicleForm';

export type VehicleFormProps = {
  onDone: () => void;
  /** Present when the form is a screen you can leave. */
  onBack?: () => void;
  /** Present during onboarding, where a car is optional. */
  onSkip?: () => void;
  /** Onboarding also asks for the nickname, when the profile has none. */
  askName?: boolean;
  /** False when onboarding only needs the nickname. */
  askCar?: boolean;
};

export function VehicleForm(props: VehicleFormProps) {
  const { onBack, onSkip, askName = false, askCar = true } = props;
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();
  const form = useVehicleForm(props);
  const hex = CAR_COLORS[form.color];
  const onboarding = askName || !!onSkip;

  return (
    <KeyboardAvoidingView style={sharedStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title={translate(onboarding ? 'vehicle.onboardTitle' : 'vehicle.addTitle')}
          subtitle={translate(onboarding ? 'vehicle.onboardSubtitle' : 'vehicle.addSubtitle')}
          onBack={onBack}
        />

        {askName ? (
          <Field
            label={translate('vehicle.nickname')}
            placeholder={translate('vehicle.nicknamePlaceholder')}
            hint={translate('vehicle.nicknameHint')}
            icon={IconName.User}
            value={form.name}
            onChangeText={form.setName}
            autoComplete="given-name"
            textContentType="givenName"
            maxLength={30}
            error={form.fieldErrors.name}
          />
        ) : null}

        {askCar ? (
          <>
            <View style={[styles.preview, { backgroundColor: alpha(hex, 0.15), borderColor: alpha(hex, 0.3) }]}>
              <Icon name={IconName.Car} size={56} color={hex} />
            </View>

            <Field
              label={translate('vehicle.makeModel')}
              placeholder={translate('vehicle.makeModelPlaceholder')}
              icon={IconName.Shapes}
              value={form.makeModel}
              onChangeText={form.setMakeModel}
              maxLength={60}
              error={form.fieldErrors.makeModel}
            />

            <Text style={[sharedStyles.label, styles.colorLabel]}>{translate('vehicle.color')}</Text>
            <ColorPicker value={form.color} onChange={form.setColor} />

            <Field
              label={translate('vehicle.plate')}
              placeholder={translate('vehicle.platePlaceholder')}
              hint={translate('vehicle.plateHint')}
              icon={IconName.Plate}
              value={form.plate}
              onChangeText={form.onPlateChange}
              keyboardType="number-pad"
              maxLength={3}
              error={form.fieldErrors.plate}
              style={styles.plate}
            />
          </>
        ) : null}

        {form.error ? <Text style={sharedStyles.error}>{form.error}</Text> : null}

        <View style={styles.actions}>
          <Button
            large
            icon={onboarding ? IconName.Check : IconName.Plus}
            label={translate(onboarding ? 'vehicle.continue' : 'vehicle.add')}
            loading={form.saving}
            onPress={form.save}
          />
          {onSkip ? <LinkText label={translate('vehicle.skip')} color={colors.textTertiary} onPress={form.skip} /> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
