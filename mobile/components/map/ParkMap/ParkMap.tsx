/* The live map behind the home screen. Camera behaviour lives in useParkMap;
   this file only draws. */

import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import type { LatLng } from '../../../lib/geo';
import { colors } from '../../../theme';
import { GlassCard, Icon, IconName, useSheetHeight } from '../../ui';
import { UserDot } from '../markers';
import { darkMapStyle } from './mapStyle';
import { styles } from './ParkMap.styles';
import { useParkMap } from './useParkMap';

type Props = {
  me: LatLng | null;
  /** Compass bearing, for the cone on my own marker. */
  heading: number | null;
  /** Radar ring colour while the driver is waiting for a match. */
  radar: string | null;
  locateLabel: string;
};

const toCoordinate = (point: LatLng) => ({ latitude: point.lat, longitude: point.lng });

export function ParkMap({ me, heading, radar, locateLabel }: Props) {
  // However tall the panel at the bottom currently is — see SheetHeightProvider.
  const bottomInset = useSheetHeight();
  const { map, initialRegion, following, recenter, onMapReady, onPanDrag, onRegionChangeComplete } = useParkMap([me]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        customMapStyle={darkMapStyle}
        userInterfaceStyle="light"
        showsUserLocation={false}
        showsCompass={false}
        showsPointsOfInterests={false}
        toolbarEnabled={false}
        pitchEnabled={false}
        /* Keeps the centre, and Apple's logo and legal link (which must stay
           visible), above the controls that cover the bottom of the map. */
        mapPadding={{ top: 0, right: 0, bottom: bottomInset, left: 0 }}
        onMapReady={onMapReady}
        onPanDrag={onPanDrag}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {me ? (
          <Marker
            coordinate={toCoordinate(me)}
            anchor={{ x: 0.5, y: 0.5 }}
            /* Android rasterises a custom marker once; one that turns has to
               ask for redraws. The bearing is rounded upstream to keep that
               from running wild. */
            tracksViewChanges={!!radar || heading != null}
            zIndex={10}
          >
            <UserDot heading={heading} radar={radar} />
          </Marker>
        ) : null}
      </MapView>

      {me ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locateLabel}
          onPress={recenter}
          style={[styles.locate, { bottom: bottomInset + 16 }]}
        >
          <GlassCard style={styles.locateCard}>
            <Icon name={IconName.Locate} color={following ? colors.primary : colors.textSecondary} />
          </GlassCard>
        </Pressable>
      ) : null}
    </View>
  );
}
