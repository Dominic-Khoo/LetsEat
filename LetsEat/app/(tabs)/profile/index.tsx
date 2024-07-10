import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { onValue, ref } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "@/components/SplashScreen"; // Import SplashScreen

const Profile = () => {
  const [loading, setLoading] = useState(true); // Add loading state
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [campusAccomodation, setCampusAccomodation] = useState<string>("");
  const [preferredCuisine, setPreferredCuisine] = useState<string>("");
  const [loadingImage, setLoadingImage] = useState(true); // Add loading state
  const [imageSource, setImageSource] = useState<string | null>(null);

  const user = FIREBASE_AUTH.currentUser;

  const fetchData = useCallback(() => {
    if (user) {
      const userRef = ref(FIREBASE_DB, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          if (data.username) setUsername(data.username);
          if (data.bio) setBio(data.bio);
          if (data.faculty) setFaculty(data.faculty);
          if (data.campusAccomodation)
            setCampusAccomodation(data.campusAccomodation);
          if (data.preferredCuisine) setPreferredCuisine(data.preferredCuisine);
        }
        setLoading(false); // Set loading to false when data is loaded
      });

      setImageSource(user.photoURL || null);
    } else {
      setLoading(false); // Set loading to false if no user is found
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return <SplashScreen />; // Render SplashScreen while loading
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 20 }} />
        <View style={styles.imageContainer}>
          {loadingImage && <ActivityIndicator size="large" color="#ff6f69" />}
          <Image
            style={styles.userImg}
            source={
              imageSource
                ? { uri: imageSource }
                : require("../../../assets/images/default.png")
            }
            onLoad={() => setLoadingImage(false)} // Set loading to false when the image loads
            onError={() => {
              setLoadingImage(false);
              setImageSource(null); // Set default image if there's an error loading the image
            }}
          />
        </View>

        <Text className="pt-5 text-2xl text-center font-pblack">
          {username}
        </Text>

        <Text className="pt-3 text-center font-pnormal">{bio}</Text>
        <View style={styles.userBtnWrapper}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => router.push("./profile/components/EditProfile")}
          >
            <Text style={styles.logoutText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              FIREBASE_AUTH.signOut();
              AsyncStorage.removeItem("modalShown");
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>Faculty</Text>
            <Text style={styles.userInfoSubTitle}>{faculty}</Text>
          </View>
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>Campus Accomodation</Text>
            <Text style={styles.userInfoSubTitle}>{campusAccomodation}</Text>
          </View>
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>Preferred Cuisines</Text>
            <Text style={styles.userInfoSubTitle}>{preferredCuisine}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.achievementsButton}
          onPress={() => router.push("./profile/components/Achievements")}
        >
          <Text style={styles.achievementsText}>View Achievements</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White background color for the container
  },
  userImg: {
    height: 120,
    width: 120,
    borderRadius: 75,
    borderColor: "black", // Add black border color
    borderWidth: 2, // Add border width
  },
  userBtnWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#FFCACA", // Light red background color for the logout button
    padding: 10,
    borderRadius: 8,
    margin: 20,
    alignItems: "center",
  },
  logoutText: {
    color: "#000000", // Black text color for the logout button text
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  userInfoWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    borderRadius: 5,
    margin: 5,
    backgroundColor: "#ff6f69",
    padding: 12,
    shadowOpacity: 0.2,
  },
  userInfoItem: {
    justifyContent: "center",
  },
  userInfoTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
  userInfoSubTitle: {
    fontSize: 17,
    color: "black",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  achievementsButton: {
    backgroundColor: "#FFCACA",
    padding: 10,
    borderRadius: 8,
    margin: 14,
    alignItems: "center",
  },
  achievementsText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
});
