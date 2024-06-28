import React, { useState, useEffect } from "react";
import { View, StyleSheet, Button } from "react-native";
import MapView, { Marker } from "react-native-maps";
import eateriesData from "../../../../eateries.json";
import imageMap from "../../../../imageMap";
import { FIREBASE_AUTH } from "@/firebaseConfig";
import { Alert, Share } from "react-native";
import * as Location from "expo-location";
import { LocationObjectCoords } from "expo-location";

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

type MapScreenProps = {
  onSelectEatery: (eatery: Eatery) => void;
};

const MapScreen: React.FC<MapScreenProps> = ({ onSelectEatery }) => {
  const [eateries, setEateries] = useState<Eatery[]>([]);
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);

  const user = FIREBASE_AUTH.currentUser;

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
    console.log(location.coords);

    // Show an alert when the location is updated
    Alert.alert(user?.displayName ?? "User", "Location Updated", [
      {
        text: "Close",
        onPress: () => console.log("Close Pressed"),
        style: "destructive",
      },
    ]);
  };

  // Function to share the user's location
  const shareLocation = async () => {
    try {
      const result = await Share.share({
        // Create a Google Maps link using the user's location
        message: `https://www.google.com/maps/search/?api=1&query=${location?.latitude},${location?.longitude}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("shared with activity type of ", result.activityType);
        } else {
          console.log("shared");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("dismissed");
      }
    } catch (error) {
      // Show an alert if there's an error while sharing location
      Alert.alert("Error", "Something went wrong while sharing location", [
        {
          text: "Close",
          onPress: () => console.log("Close Pressed"),
          style: "destructive",
        },
      ]);
    }
  };

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
      <Button title="Update Location" onPress={fetchLocation} />
      <Button title="Share Location" onPress={shareLocation} />

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
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            pinColor="blue"
            title="Your Location"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "60%",
    width: "100%",
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
