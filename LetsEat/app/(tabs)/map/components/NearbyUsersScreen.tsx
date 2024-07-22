import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { FIREBASE_DB, FIREBASE_AUTH } from "@/firebaseConfig";
import { ref as ref2, onValue, push, set } from "firebase/database";
import * as Location from "expo-location";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type User = {
  id: string;
  username: string;
  location: {
    latitude: number;
    longitude: number;
  };
};

const NearbyUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log("Current user location:", location.coords);
      setCurrentUserLocation(location.coords);
    };

    fetchLocation();

    const usersRef = ref2(FIREBASE_DB, "users/");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray: User[] = Object.keys(data).map((key) => ({
          id: key,
          username: data[key].username,
          location: data[key].location,
        }));
        console.log("Fetched users from Firebase:", usersArray);
        setUsers(usersArray);
      } else {
        console.log("No users found in Firebase.");
      }
    });
  }, []);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const currentUser = FIREBASE_AUTH.currentUser;
  const nearbyUsers = users.filter((user) => {
    if (currentUserLocation && user.location && user.id !== currentUser?.uid) {
      const distance = calculateDistance(
        currentUserLocation.latitude,
        currentUserLocation.longitude,
        user.location.latitude,
        user.location.longitude
      );
      console.log(
        `Distance to user ${user.username}: ${distance.toFixed(2)} km`
      );
      return distance <= 2; // Filter users within 2 km radius
    }
    return false;
  });

  const handleViewProfile = (userId: string) => {
    router.push({
      pathname: "/map/components/PublicProfile",
      params: { uid: userId },
    });
  };

  const handleSendRequest = async (userId: string) => {
    if (!currentUser) {
      Alert.alert("Error", "No current user found.");
      return;
    }

    const requestsRef = ref2(FIREBASE_DB, `users/${userId}/openJioRequests`);

    const newRequest = {
      requesterEmail: currentUser.email,
      requesterUid: currentUser.uid,
      requesterUsername: currentUser.displayName || "Anonymous",
    };

    try {
      const newRequestRef = push(requestsRef);
      await set(newRequestRef, newRequest);
      Alert.alert("Request sent");
    } catch (error) {
      console.error("Error sending request:", error);
      Alert.alert("Error", "Failed to send request.");
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 3,
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.navigate("/map")}
          style={styles.backButton}
        >
          <Image
            source={require("../../../../assets/icons/back.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text className="text-xl text-center font-pbold">Nearby Users</Text>
      </View>
      <FlatList
        data={nearbyUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.distance}>
                {calculateDistance(
                  currentUserLocation?.latitude ?? 0,
                  currentUserLocation?.longitude ?? 0,
                  item.location.latitude,
                  item.location.longitude
                ).toFixed(2)}{" "}
                km away
              </Text>
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleViewProfile(item.id)}
              >
                <Text style={styles.buttonText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleSendRequest(item.id)}
              >
                <Text style={styles.buttonText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  backButton: {
    position: "absolute",
    left: 0,
  },

  backIcon: {
    width: 18,
    height: 16,
  },

  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  distance: {
    fontSize: 14,
    color: "#888",
  },
  buttonsContainer: {
    paddingTop: 10,
    flexDirection: "row",
  },
  button: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#ffd1df",
    borderRadius: 3,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: "Poppins",
  },
});

export default NearbyUsersScreen;
