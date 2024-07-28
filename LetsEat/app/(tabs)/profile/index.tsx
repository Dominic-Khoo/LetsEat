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
import { getAuth } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "@/components/SplashScreen";
import Slider from "@react-native-community/slider";
import { ProgressBar } from "react-native-paper";
import { calculateLevel, calculateExpWithinLevel } from "../../../expLevels";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [campusAccommodation, setCampusAccommodation] = useState<string>("");
  const [preferredCuisine, setPreferredCuisine] = useState<string>("");
  const [loadingImage, setLoadingImage] = useState(true);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [status, setStatus] = useState<number>(1);
  const [totalExp, setTotalExp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [currentLevelExp, setCurrentLevelExp] = useState<number>(0);
  const [nextLevelExp, setNextLevelExp] = useState<number>(100);
  const [showExp, setShowExp] = useState<boolean>(false);

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
          if (data.campusAccommodation) setCampusAccommodation(data.campusAccommodation);
          if (data.preferredCuisine) setPreferredCuisine(data.preferredCuisine);
          if (data.status !== undefined) {
            setStatus(data.status === "open" ? 1 : 0);
          }
          if (data.exp !== undefined) setTotalExp(data.exp);
        }
        setLoading(false);
      });

      setImageSource(user.photoURL || null);
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLevel(calculateLevel(totalExp));
    const { currentLevelExp, nextLevelExp } = calculateExpWithinLevel(totalExp);
    setCurrentLevelExp(currentLevelExp);
    setNextLevelExp(nextLevelExp);
  }, [totalExp]);

  const handleStatusChange = (value: number) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      const statusRef = ref(FIREBASE_DB, `users/${currentUser.uid}/status`);
      set(statusRef, value === 1 ? "open" : "closed");
      setStatus(value);
    }
  };

  const handleExpToggle = () => {
    setShowExp(!showExp);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return <SplashScreen />;
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
            onLoad={() => setLoadingImage(false)}
            onError={() => {
              setLoadingImage(false);
              setImageSource(null);
            }}
          />
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.usernameText}>{username}</Text>
          <TouchableOpacity onPress={handleExpToggle}>
            <Text style={styles.levelText}>LVL {level}</Text>
          </TouchableOpacity>
        </View>

        {showExp && (
          <View style={styles.expContainer}>
            <Text style={styles.expText}>EXP: {currentLevelExp} / {nextLevelExp}</Text>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={currentLevelExp / nextLevelExp}
                color="#FF6F69"
                style={styles.progressBar}
              />
            </View>
          </View>
        )}

        <Text style={styles.bioText}>{bio}</Text>
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
            <Text style={styles.userInfoTitle}>Campus Accommodation</Text>
            <Text style={styles.userInfoSubTitle}>{campusAccommodation}</Text>
          </View>
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>Preferred Cuisines</Text>
            <Text style={styles.userInfoSubTitle}>{preferredCuisine}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.achievementsButton}
            onPress={() => router.push("./profile/components/Achievements")}
          >
            <Text style={styles.achievementsText}>View Achievements</Text>
          </TouchableOpacity>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderText}>
              {status === 1 ? "Open to Strangers" : "Not Open to Strangers"}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={1}
              value={status}
              onValueChange={handleStatusChange}
              minimumTrackTintColor="#FF6F69"
              maximumTrackTintColor="#FF6F69"
              thumbTintColor="#FF6F69"
            />
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
    backgroundColor: "#FFFFFF",
  },
  userImg: {
    height: 120,
    width: 120,
    borderRadius: 75,
    borderColor: "black",
    borderWidth: 2,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  usernameText: {
    fontSize: 24,
    fontFamily: "Poppins-Black",
    textAlign: "center",
  },
  levelText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    color: "#FF6F69",
    marginTop: 5,
  },
  bioText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginVertical: 10,
  },
  expContainer: {
    width: '90%',
    alignItems: 'center',
    marginTop: 10,
  },
  expText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    marginBottom: 5,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  userBtnWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#FFCACA",
    padding: 10,
    borderRadius: 8,
    margin: 20,
    alignItems: "center",
  },
  logoutText: {
    color: "#000000",
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
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginVertical: 20,
  },
  achievementsButton: {
    backgroundColor: "#FFCACA",
    padding: 10,
    borderRadius: 8,
    margin: 14,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  achievementsText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  sliderContainer: {
    alignItems: "center",
    flex: 1,
  },
  sliderText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 5,
    textAlign: "center",
  },
  slider: {
    width: 100,
  },
});
