import { Alert, Button, Share, Text, View } from "react-native";
import React, { useState } from "react";
import MapScreen from "./components/MapScreen";
import EateryPopup from "./components/EateryPopup";
import * as Location from "expo-location";
import { LocationObjectCoords } from "expo-location";
import { FIREBASE_AUTH } from "@/firebaseConfig";

type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

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
      <View className="bg-red-200 pt-3">
        <Text className="text-xl text-center h-10 font-pblack">Map</Text>
      </View>
      <MapScreen onSelectEatery={setSelectedEatery} />
      <EateryPopup
        eatery={selectedEatery}
        onClose={() => setSelectedEatery(null)}
      />
    </View>
  );
};

export default Map;
