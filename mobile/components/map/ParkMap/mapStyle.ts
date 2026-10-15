/* Google Maps (Android) dark style matching the mockups' navy map. iOS uses
   Apple Maps with userInterfaceStyle="dark" and ignores this. */
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1320' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5b6b86' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1320' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#18233a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111827' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1f3052' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1a33' }] },
];
