import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

type Eatery = {
  id: number;
  name: string;
  description: string;
  address: string;
  openingHours: Record<DayOfWeek, string>;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  imageTab: any;
  imagePopup: any; 
};

type MapScreenProps = {
  onSelectEatery: (eatery: Eatery) => void;
};

const MapScreen: React.FC<MapScreenProps> = ({ onSelectEatery }) => {
  const eateries: Eatery[] = [
    {
      id: 1,
      name: 'Deck',
      description: 'Arts Canteen',
      address: 'Computing Drive, NUS School of Computing',
      openingHours: {
        sunday: 'Closed',
        monday: '8:00 AM - 7:00 PM',
        tuesday: '8:00 AM - 7:00 PM',
        wednesday: '8:00 AM - 7:00 PM',
        thursday: '8:00 AM - 7:00 PM',
        friday: '8:00 AM - 7:00 PM',
        saturday: 'Closed',
      },
      coordinate: { latitude: 1.29454, longitude: 103.77258 },
      imageTab: require("../../../../assets/images/deck.png"),
      imagePopup: require("../../../../assets/images/deckoutside.jpeg")
    },
    {
      id: 2,
      name: 'Eatery 2',
      description: 'Amazing dishes!',
      address: '456 Taste Avenue',
      openingHours: {
        sunday: '9:00 AM - 11:00 PM',
        monday: '9:00 AM - 11:00 PM',
        tuesday: '9:00 AM - 11:00 PM',
        wednesday: '9:00 AM - 11:00 PM',
        thursday: '9:00 AM - 11:00 PM',
        friday: '9:00 AM - 11:00 PM',
        saturday: '9:00 AM - 11:00 PM',
      },
      coordinate: { latitude: 37.78825, longitude: -122.435 },
      imageTab: require("../../../../assets/images/deck.png"),
      imagePopup: require("../../../../assets/images/deckoutside.jpeg")
    },
    // Add more eateries as needed
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 1.2966,
          longitude: 103.7764,
          latitudeDelta: 0.0222,
          longitudeDelta: 0.02021,
        }}
      >
        {eateries.map((eatery) => (
          <Marker
            key={eatery.id}
            coordinate={eatery.coordinate}
            title={eatery.name}
            description={eatery.description}
            onPress={() => onSelectEatery(eatery)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '60%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
