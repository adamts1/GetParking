/* The one map screen. What sits on top of the map is decided by the server's
   session — idle, waiting or matched — never by navigation, so a relaunch
   mid-session lands exactly where the driver left off. */

import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { ParkMap } from '../../components/map';
import { SheetHeightProvider, Toast } from '../../components/ui';
import { sharedStyles } from '../../theme';
import { IdleActions } from './IdleActions';
import { MatchedSheet } from './MatchedSheet';
import { TopBar } from './TopBar';
import { useHomeScreen } from './useHomeScreen';
import { WaitingSheet } from './WaitingSheet';

export function HomeScreen() {
  // Whatever covers the bottom measures itself so the map knows what it hides.
  return (
    <SheetHeightProvider>
      <HomeContent />
    </SheetHeightProvider>
  );
}

function HomeContent() {
  const home = useHomeScreen();

  return (
    <View style={sharedStyles.screen}>
      {/* The map is light (see ParkMap), unlike the app's other screens. */}
      <StatusBar style="dark" />
      <ParkMap {...home.map} />

      {!home.session ? (
        <>
          <TopBar
            vehicle={home.vehicle}
            credits={home.credits}
            locationDenied={home.locationDenied}
            onOpenVehicles={home.openVehicles}
            onOpenProfile={home.openProfile}
            onOpenSettings={home.openSettings}
          />
          <IdleActions
            canStart={home.canStart}
            starting={home.starting}
            onSearch={home.startSearch}
            onLeave={home.startLeave}
          />
        </>
      ) : home.match ? (
        <MatchedSheet
          match={home.match}
          phase={home.phase}
          distance={home.distance}
          cancelling={home.cancelling}
          confirming={home.confirming}
          onCancel={home.cancel}
          onNavigate={home.navigate}
          onConfirmParked={() => void home.confirmParked()}
        />
      ) : (
        <WaitingSheet session={home.session} cancelling={home.cancelling} onCancel={home.cancel} />
      )}

      {home.toast ? <Toast text={home.toast.text} tone={home.toast.tone} /> : null}
    </View>
  );
}
