import React, { useEffect, useState } from "react";
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
import { router } from "expo-router";
import { onValue, ref } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { images } from "@/constants";
import SplashScreen from "@/components/SplashScreen"; // Import SplashScreen

const Profile = () => {
  const [loading, setLoading] = useState(true); // Add loading state
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [faculty, setFaculty] = useState("");
  const [campusAccomodation, setCampusAccomodation] = useState("");
  const [preferredCuisine, setPreferredCuisine] = useState("");
  const [loadingImage, setLoadingImage] = useState(true); // Add loading state

  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
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
    } else {
      setLoading(false); // Set loading to false if no user is found
    }
  }, []);

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
        <View style={{ height: 30 }} />
        <View style={styles.imageContainer}>
          {loadingImage && <ActivityIndicator size="large" color="#ff6f69" />}
          <Image
            style={styles.userImg}
            source={user?.photoURL ? { uri: user.photoURL } : images.profile}
            onLoad={() => setLoadingImage(false)} // Set loading to false when the image loads
            onError={() => setLoadingImage(false)} // Set loading to false if there's an error loading the image
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
    borderRadius: 2,
    margin: 10,
    backgroundColor: "#ff6f69",
    padding: 15,
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
  },
  userInfoSubTitle: {
    fontSize: 17,
    color: "black",
    textAlign: "center",
  },
});
