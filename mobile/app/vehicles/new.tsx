import { router } from 'expo-router';
import { VehicleForm } from '../../screens';

export default function NewVehicleRoute() {
  return <VehicleForm onBack={() => router.back()} onDone={() => router.back()} />;
}
