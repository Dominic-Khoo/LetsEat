import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/firebaseConfig";
import { ref, get, update, set } from "firebase/database";
import { MultiSelect } from "react-native-element-dropdown";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { images } from "@/constants";
import * as Animatable from "react-native-animatable";

const PreferredFood = () => {
  const [preferredCuisine, setPreferredCuisine] = useState<string[]>([]);

  // Label and value for the preferred cuisine dropdown
  const dataCuisine = [
    { label: "Chinese", value: " Chinese " },
    { label: "Malay", value: " Malay " },
    { label: "Indian", value: " Indian " },
    { label: "Western", value: " Western " },
    { label: "Thai", value: " Thai " },
    { label: "Korean", value: " Korean " },
    { label: "Japanese", value: " Japanese" },
  ];

  const user = FIREBASE_AUTH.currentUser;

  // Set the profile data
  const submitData = async () => {
    // Save other profile data
    if (user) {
      try {
        // Retrieve the existing user data
        const userRef = ref(FIREBASE_DB, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        console.log(user.displayName);

        // Update the database with the new data, keeping the existing email
        await set(userRef, {
          username: userData.username,
          email: userData.email,
          profilePicture: user.photoURL,
          bio: userData.bio,
          faculty: userData.faculty,
          campusAccomodation: userData.campusAccomodation,
          preferredCuisine:
            preferredCuisine.length > 0
              ? preferredCuisine
              : userData.preferredCuisine,
        });

        console.log("Profile data saved successfully");
        Alert.alert("Profile saved. Verify your email and log in!");
      } catch (error) {
        console.log("Error saving profile data", error);
      }
    }
    signOut(FIREBASE_AUTH);
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Animatable.Text
          style={{
            fontSize: 20,
            color: "black",
            fontWeight: "bold",
            alignItems: "center",
          }}
          animation="slideInLeft"
        >
          Last but not least...
        </Animatable.Text>
      </View>
      <View style={{ height: 30 }} />
      <View style={{ paddingHorizontal: 20 }}>
        <MultiSelect
          style={styles.multiselect}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          data={dataCuisine}
          labelField="label"
          valueField="value"
          placeholder="Preferred cuisines"
          value={preferredCuisine}
          onChange={(item) => {
            setPreferredCuisine(item);
          }}
          renderSelectedItem={(item, unSelect) => (
            <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
              <View style={styles.selectedStyle}>
                <Text style={styles.textSelectedStyle}>{item.label}</Text>
                <AntDesign color="black" name="delete" size={17} />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={{ height: 55 }} />
      <Animatable.View style={{ alignItems: "center" }} animation="bounceIn">
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            submitData();
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
            Let's go!
          </Text>
        </TouchableOpacity>
      </Animatable.View>
      <View style={styles.imageContainer}>
        <Animatable.Image
          source={images.ramen}
          style={styles.image}
          animation="fadeInUp"
        />
      </View>
    </View>
  );
};

export default PreferredFood;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#cdecc2",
  },

  imageContainer: {
    alignItems: "center",
    marginTop: 100,
  },

  image: {
    width: 400,
    height: 180,
    resizeMode: "contain",
  },
  multiselect: {
    height: 50,
    backgroundColor: "white",

    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.6,
    shadowRadius: 1.5,

    elevation: 2,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "white",
    shadowColor: "#000",
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#638c5f",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    shadowOpacity: 0.2,
  },
});
