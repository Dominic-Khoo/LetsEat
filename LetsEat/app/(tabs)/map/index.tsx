import { Text, View } from 'react-native';
import React, { useState } from 'react';
import MapScreen from './components/MapScreen';
import EateryPopup from './components/EateryPopup';

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

const Map = () => {
  const [selectedEatery, setSelectedEatery] = useState<Eatery | null>(null);

  return (
    <View className="flex-1">
      <View className="bg-red-200 pt-5">
        <Text className="text-2xl text-center h-12 font-pblack">Map</Text>
      </View>
      <MapScreen onSelectEatery={setSelectedEatery} />
      <EateryPopup eatery={selectedEatery} onClose={() => setSelectedEatery(null)} />
    </View>
  );
};

export default Map;
