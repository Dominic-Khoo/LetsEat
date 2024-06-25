import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FIREBASE_AUTH, storage } from "@/firebaseConfig";
import { FIREBASE_DB } from "@/firebaseConfig";
import { ref as ref2, get, set, update, onValue } from "firebase/database";
import { router } from "expo-router";
import { updateProfile } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/constants";

const EditProfile = () => {
  const [bio, setBio] = useState("");
  const [faculty, setFaculty] = useState("");
  const [facultyLabel, setFacultyLabel] = useState("");
  const [campusAccomodation, setCampusAccomodation] = useState("");
  const [campusAccomodationLabel, setCampusAccomodationLabel] = useState("");
  const [preferredCuisine, setPreferredCuisine] = useState<string[]>([]);

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

  // Get data of current user
  const user = FIREBASE_AUTH.currentUser;

  // Set the profile data
  const submitData = async () => {
    // Save other profile data
    if (user) {
      try {
        // Retrieve the existing user data
        const userRef = ref2(FIREBASE_DB, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        console.log(user.displayName);

        // Update the database with the new data, keeping the existing email
        await set(userRef, {
          username: userData.username,
          email: userData.email,
          profilePicture: user.photoURL,
          bio: bio !== "" ? bio : userData.bio,
          faculty: facultyLabel !== "" ? facultyLabel : userData.faculty,
          campusAccomodation:
            campusAccomodationLabel !== ""
              ? campusAccomodationLabel
              : userData.campusAccomodation,
          preferredCuisine:
            preferredCuisine.length > 0
              ? preferredCuisine
              : userData.preferredCuisine,
        });

        console.log("Profile data saved successfully");
      } catch (error) {
        console.log("Error saving profile data", error);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 }}>
      <Text className="text-l text-center font-semibold pt-2">
        Edit Profile
      </Text>
      <View style={{ alignItems: "center" }}>
        <View style={{ height: 20 }} />
        <Text className="p-2 text-xl text-center font-bold">
          {user?.displayName}
        </Text>
        <TouchableOpacity onPress={() => router.replace("./UpdateImage")}>
          <View
            style={{
              height: 100,
              width: 100,
              borderRadius: 15,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ImageBackground
              source={user?.photoURL ? { uri: user.photoURL } : images.profile}
              style={{ height: 100, width: 100 }}
              imageStyle={{ borderRadius: 15 }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={35}
                  color="#fff"
                  style={{
                    opacity: 0.7,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#fff",
                    borderRadius: 10,
                  }}
                />
              </View>
            </ImageBackground>
          </View>
        </TouchableOpacity>
        <View style={{ height: 15 }} />
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Bio"
            placeholderTextColor="#888"
            value={bio}
            onChangeText={setBio}
            style={styles.input}
          />

          <View style={styles.underline} />
        </View>
      </View>

      <Text className="text-l text-left font-semibold pt-3">
        Other Information
      </Text>

      <View style={{ height: 15 }} />

      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "#ff6f69" }]}
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
        style={[styles.dropdown, isFocus2 && { borderColor: "#ff6f69" }]}
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

      <View style={{ height: 15 }} />
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
      <View style={{ height: 50 }} />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          submitData();
        }}
      >
        <Text style={{ fontSize: 14, fontFamily: "Poppins-SemiBold" }}>
          Save Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={{ fontSize: 13, color: "#66545e" }}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#ddd",
    borderRadius: 50,
    marginBottom: 20,
  },

  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    paddingVertical: 5,
    color: "#000",
  },
  underline: {
    width: "100%",
    height: 1,
    backgroundColor: "#888",
    marginTop: -1,
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
    backgroundColor: "#FFCACA",
    padding: 10,
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
});

export default EditProfile;
