import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/firebaseConfig";
import { router } from "expo-router";
import { onValue, ref } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [faculty, setFaculty] = useState("");
  const [campusAccomodation, setCampusAccomodation] = useState("");
  const [preferredCuisine, setPreferredCuisine] = useState("");
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    if (user) {
      const userRef = ref(FIREBASE_DB, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.bio) {
          setBio(data.bio);
        }
        if (data && data.faculty) {
          setFaculty(data.faculty);
        }
        if (data && data.campusAccomodation) {
          setCampusAccomodation(data.campusAccomodation);
        }
        if (data && data.preferredCuisine) {
          setPreferredCuisine(data.preferredCuisine);
        }
      });
    }
  }, []);

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
        <Image
          style={styles.userImg}
          source={user?.photoURL ? { uri: user.photoURL } : undefined}
        />

        <Text className="pt-5 text-2xl text-center h-12 font-pblack">
          {user?.displayName}
        </Text>

        <Text className="pt-5 text-center font-pnormal">{bio}</Text>
        <View style={styles.userBtnWrapper}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => router.push("./profile/components/EditProfile")}
          >
            <Text style={styles.logoutText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {FIREBASE_AUTH.signOut();
                            AsyncStorage.removeItem('modalShown');}
            }
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>Faculty</Text>
            <Text style={styles.userInfoSubTitle}>{faculty}</Text>
          </View>

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
    height: 150,
    width: 150,
    borderRadius: 75,
  },

  userBtnWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
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
    width: "100%",
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: "center",
  },
  userInfoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 3,
    textAlign: "center",
  },
  userInfoSubTitle: {
    fontSize: 10,
    color: "#7D7D7D",
    textAlign: "center",
  },
});
