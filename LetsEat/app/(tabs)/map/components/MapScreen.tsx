import React, {useState, useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import eateriesData from '../../../../eateries.json';
import imageMap from '../../../../imageMap';

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
    const [eateries, setEateries] = useState<Eatery[]>([]);

    useEffect(() => {
      const loadEateries = async () => {
        const loadedEateries = eateriesData.map((eatery) => ({
          ...eatery,
          imageTab: imageMap[eatery.imageTab],
          imagePopup: imageMap[eatery.imagePopup],
        }));
        setEateries(loadedEateries);
      };
      loadEateries();
    }, []);

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
