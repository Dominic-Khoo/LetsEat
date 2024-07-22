import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Share,
  Touchable,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import eateriesData from "../../../../eateries.json";
import imageMap from "../../../../imageMap";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/firebaseConfig";
import * as Location from "expo-location";
import { LocationObjectCoords } from "expo-location";
import { onValue, ref, set, update } from "firebase/database";
import { router } from "expo-router";

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const user = FIREBASE_AUTH.currentUser;
  const db = FIREBASE_DB;

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
    if (user) {
      writeUserLocation(
        user.uid,
        user.displayName,
        location.coords.latitude,
        location.coords.longitude
      );
    }
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

  useEffect(() => {
    const usersRef = ref(db, "users/");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const usersArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setUsers(usersArray);
    });
  }, []);

  const writeUserLocation = (
    userId: string,
    name: string | null,
    latitude: number,
    longitude: number
  ) => {
    update(ref(db, "users/" + userId), {
      location: {
        latitude: latitude,
        longitude: longitude,
      },
    });
  };

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

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
      <TouchableOpacity style={styles.button} onPress={fetchLocation}>
        <Text style={styles.buttonText}>Update Location</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={shareLocation}>
        <Text style={styles.buttonText}>Share Location</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("./map/components/NearbyUsersScreen")}
      >
        <Text style={styles.buttonText}>Show Nearby Users</Text>
      </TouchableOpacity>

      <View style={{ height: 5 }} />

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
    flex: 1,
    width: "100%",
  },
  map: {
    flex: 1,
  },
  button: {
    backgroundColor: "#ff6f69",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginHorizontal: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Poppins-SemiBold",
  },
});

export default MapScreen;
