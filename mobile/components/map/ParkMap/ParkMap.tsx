/* The live map behind the home screen: me, the other driver, the spot.
   Camera behaviour lives in useParkMap; this file only draws. */

import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import type { LatLng } from '../../../lib/geo';
import { alpha, colors } from '../../../theme';
import { GlassCard, Icon, IconName, useSheetHeight } from '../../ui';
import { DriverDot, ParkingPin, PIN_ANCHOR, UserDot } from '../markers';
import { darkMapStyle } from './mapStyle';
import { styles } from './ParkMap.styles';
import { useParkMap } from './useParkMap';

type Props = {
  me: LatLng | null;
  /** Compass bearing, for the cone on my own marker. */
  heading: number | null;
  /** Radar ring colour while the driver is waiting for a match. */
  radar: string | null;
  /** The other driver, while matched, drawn in their side's colour. */
  other: LatLng | null;
  otherColor: string;
  /** The spot being handed over, while matched. */
  spot: LatLng | null;
  /** A dashed line from whoever is driving to the spot. */
  routeFrom: LatLng | null;
  routeColor: string;
  locateLabel: string;
};

const toCoordinate = (point: LatLng) => ({ latitude: point.lat, longitude: point.lng });

export function ParkMap({ me, heading, radar, other, otherColor, spot, routeFrom, routeColor, locateLabel }: Props) {
  // However tall the panel at the bottom currently is — see SheetHeightProvider.
  const bottomInset = useSheetHeight();
  const { map, initialRegion, following, recenter, onMapReady, onPanDrag, onRegionChangeComplete } = useParkMap([me, other, spot]);

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
        {routeFrom && spot ? (
          <Polyline
            coordinates={[toCoordinate(routeFrom), toCoordinate(spot)]}
            strokeColor={alpha(routeColor, 0.67)}
            strokeWidth={3}
            lineDashPattern={[8, 6]}
          />
        ) : null}

        {/* PIN_ANCHOR, not {x:0.5,y:1}: the pin's point is a rotated corner
            partway up its own view, so the marker cannot assume the bottom. */}
        {spot ? (
          <Marker coordinate={toCoordinate(spot)} anchor={PIN_ANCHOR} tracksViewChanges={false}>
            <ParkingPin />
          </Marker>
        ) : null}

        {other ? (
          <Marker coordinate={toCoordinate(other)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <DriverDot color={otherColor} />
          </Marker>
        ) : null}

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
