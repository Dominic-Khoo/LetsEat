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
import { FIREBASE_DB } from "../../../../firebaseConfig";
import { useRouter, useLocalSearchParams } from "expo-router";
import { onValue, ref } from "firebase/database";
import { images } from "../../../../constants";
import SplashScreen from "../../../../components/SplashScreen"; // Adjust the import path as needed

const PublicProfile = () => {
  const { uid } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [faculty, setFaculty] = useState("");
  const [campusAccomodation, setCampusAccomodation] = useState("");
  const [preferredCuisine, setPreferredCuisine] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (uid) {
      const userRef = ref(FIREBASE_DB, `users/${uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Fetched user data:", data); // Log fetched data
        if (data) {
          if (data.username) setUsername(data.username);
          if (data.bio) setBio(data.bio);
          if (data.faculty) setFaculty(data.faculty);
          if (data.campusAccomodation)
            setCampusAccomodation(data.campusAccomodation);
          if (data.preferredCuisine) setPreferredCuisine(data.preferredCuisine);
          if (data.profilePicture) {
            setProfilePicture(data.profilePicture);
            console.log("Profile Picture URL:", data.profilePicture); // Log profile picture URL
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [uid]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/social")}
      >
        <Image
          source={require("../../../../assets/icons/back.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>
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
            source={profilePicture ? { uri: profilePicture } : images.profile}
            onLoad={() => setLoadingImage(false)}
            onError={() => setLoadingImage(false)}
          />
        </View>

        <Text style={styles.username}>{username}</Text>
        <Text style={styles.bio}>{bio}</Text>

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

export default PublicProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    position: "absolute",
    top: 8,
    left: 20,
    zIndex: 1,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  userImg: {
    height: 120,
    width: 120,
    borderRadius: 75,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    paddingTop: 5,
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Poppins-Bold",
  },
  bio: {
    paddingTop: 3,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  userInfoWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    borderRadius: 5,
    margin: 10,
    backgroundColor: "#ff6f69",
    padding: 15,
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
  },
  userInfoSubTitle: {
    fontSize: 17,
    color: "black",
    textAlign: "center",
  },
});
