import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/firebaseConfig";
import { ref, get, set, update } from "firebase/database";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { images } from "@/constants";
import * as Animatable from "react-native-animatable";

const OtherInfo = () => {
  const [faculty, setFaculty] = useState("");
  const [facultyLabel, setFacultyLabel] = useState("");
  const [campusAccomodation, setCampusAccomodation] = useState("");
  const [campusAccomodationLabel, setCampusAccomodationLabel] = useState("");
  const [loading, setLoading] = useState(true);

  // Label and value for the faculty dropdown
  const dataFaculty = [
    { label: "Business", value: "1" },
    { label: "Computing", value: "2" },
    { label: "Dentistry", value: "3" },
    { label: "Design and Engineering", value: "4" },
    { label: "Humanities and Sciences", value: "5" },
    { label: "Law", value: "6" },
    { label: "Medicine", value: "7" },
    { label: "Music", value: "8" },
    { label: "Nursing", value: "9" },
    { label: "Pharmacy", value: "10" },
    { label: "NUS College", value: "11" },
  ];

  const [isFocus, setIsFocus] = useState(false);

  // Label and value for the campus accomodation dropdown
  const dataAccoms = [
    { label: "Eusoff Hall", value: "1" },
    { label: "Kent Ridge Hall", value: "2" },
    { label: "King Edward VII Hall", value: "3" },
    { label: "Raffles Hall", value: "4" },
    { label: "Sheares Hall", value: "5" },
    { label: "Temasek Hall", value: "6" },
    { label: "College of Alice & Peter Tan", value: "7" },
    { label: "Residential College 4", value: "8" },
    { label: "Ridge View Residential College", value: "9" },
    { label: "Tembusu College", value: "10" },
    { label: "Helix House", value: "11" },
    { label: "Lighthouse", value: "12" },
    { label: "Pioneer House", value: "13" },
    { label: "Prince George's Park Residences", value: "14" },
    { label: "UTown Residence", value: "15" },
    { label: "Not Applicable", value: "16" },
  ];
  const [isFocus2, setIsFocus2] = useState(false);
  // Get data of current user
  const user = FIREBASE_AUTH.currentUser;

  // Set the profile data
  const submitData = async () => {
    setLoading(true);
    // Save other profile data
    if (user) {
      try {
        // Retrieve the existing user data
        const userRef = ref(FIREBASE_DB, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        console.log("User data retrieved: ", userData);

        // Update the database with the new data, keeping the existing email
        await update(userRef, {
          faculty: facultyLabel !== "" ? facultyLabel : userData.faculty,
          campusAccomodation:
            campusAccomodationLabel !== ""
              ? campusAccomodationLabel
              : userData.campusAccomodation,
        });

        console.log("Profile data saved successfully");
        setLoading(false);
      } catch (error) {
        console.log("Error saving profile data", error);
      }
    }
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
          animation="fadeInLeft"
        >
          Almost there...
        </Animatable.Text>
      </View>

      <View style={{ height: 30 }} />
      <View style={{ paddingHorizontal: 20 }}>
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: "#3660b7" }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={dataFaculty}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? "Faculty" : "..."}
          searchPlaceholder="Search..."
          value={faculty}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setFaculty(item.value);
            setFacultyLabel(item.label);
            setIsFocus(false);
          }}
        />
        <View style={{ height: 15 }} />

        <Dropdown
          style={[styles.dropdown, isFocus2 && { borderColor: "#3660b7" }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={dataAccoms}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus2 ? "Campus Accomodation" : "..."}
          searchPlaceholder="Search..."
          value={campusAccomodation}
          onFocus={() => setIsFocus2(true)}
          onBlur={() => setIsFocus2(false)}
          onChange={(item) => {
            setCampusAccomodation(item.value);
            setCampusAccomodationLabel(item.label);
            setIsFocus2(false);
          }}
        />
      </View>
      <View style={{ height: 20 }} />

      <Animatable.View style={styles.nextButton} animation="slideInRight">
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            submitData();
            router.push("./PreferredFood");
            console.log("Next button pressed");
          }}
        >
          <Icon name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>

      <View style={styles.imageContainer}>
        <Animatable.Image
          source={images.college}
          style={styles.image}
          animation="bounceInUp"
        />
      </View>
    </View>
  );
};

export default OtherInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#a7c0e0",
  },

  imageContainer: {
    alignItems: "center",
    marginTop: 100,
  },

  image: {
    width: 400,
    height: 210,
    resizeMode: "contain",
  },

  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
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
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
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
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  saveButton: {
    backgroundColor: "#2b64a8",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  nextButton: {
    alignItems: "flex-end",
    paddingHorizontal: 30,
  },
});
