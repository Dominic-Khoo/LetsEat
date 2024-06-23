import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  Button,
  Image,
  StyleSheet,
} from "react-native";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FIREBASE_AUTH, storage } from "@/firebaseConfig";
import { FIREBASE_DB } from "@/firebaseConfig";
import { ref as ref2, get, set, update } from "firebase/database";
import { router } from "expo-router";
import { updateProfile } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";

const EditProfile = () => {
  const [profilePicture, setProfilePicture] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [faculty, setFaculty] = useState("");
  const [campusAccomodation, setCampusAccomodation] = useState("");
  const [preferredCuisine, setPreferredCuisine] = useState("");

  // Pick an image from camera roll
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  // Take a photo using camera
  const [cameraStatus, requestCameraPermission] =
    ImagePicker.useCameraPermissions();

  const handleLaunchCamera = useCallback(async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [3, 4],
    });
    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  }, []);

  const handleCameraPermission = useCallback(async () => {
    if (cameraStatus) {
      if (
        cameraStatus.status === ImagePicker.PermissionStatus.UNDETERMINED ||
        (cameraStatus.status === ImagePicker.PermissionStatus.DENIED &&
          cameraStatus.canAskAgain)
      ) {
        const permission = await requestCameraPermission();
        if (permission.granted) {
          await handleLaunchCamera();
        }
      } else if (cameraStatus.status === ImagePicker.PermissionStatus.DENIED) {
        await Linking.openSettings();
      } else {
        await handleLaunchCamera();
      }
    }
  }, [cameraStatus, handleLaunchCamera, requestCameraPermission]);

  // Set the profile data
  const submitData = async () => {
    // Get data of current user
    const user = FIREBASE_AUTH.currentUser;

    try {
      let profilePictureURL = "";

      if (user) {
        if (profilePicture) {
          const response = await fetch(profilePicture);
          const blob = await response.blob();
          const storageRef = ref(storage, `images/${user.uid}`);
          await uploadBytes(storageRef, blob);
          profilePictureURL = await getDownloadURL(storageRef);

          await updateProfile(user, {
            photoURL: profilePictureURL,
          });

          await update(ref2(FIREBASE_DB, `users/${user.uid}`), {
            profilePicture: profilePictureURL,
          });
          console.log("Profile picture saved successfully");
        }
      }
    } catch (error) {
      console.log("Error saving profile picture", error);
    }

    // Save other profile data
    if (user) {
      try {
        // Retrieve the existing user data
        const userRef = ref2(FIREBASE_DB, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();

        // Update the user profile
        await updateProfile(user, {
          displayName: username,
        });

        // Update the database with the new data, keeping the existing email
        await set(userRef, {
          username: username || userData.username,
          email: userData.email,
          bio: bio || userData.bio,
          faculty: faculty || userData.faculty,
          campusAccomodation: campusAccomodation || userData.campusAccomodation,
          preferredCuisine: preferredCuisine || userData.preferredCuisine,
        });

        console.log("Profile data saved successfully");
      } catch (error) {
        console.log("Error saving profile data", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      <Button title="Take a picture" onPress={handleCameraPermission} />
      {profilePicture ? (
        <Image
          source={{ uri: profilePicture }}
          style={{ width: 200, height: 200 }}
        />
      ) : (
        <View style={{ width: 100, height: 100, backgroundColor: "#ddd" }} />
      )}

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Faculty"
        value={faculty}
        onChangeText={setFaculty}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Campus Accomodation"
        value={campusAccomodation}
        onChangeText={setCampusAccomodation}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Preferred Cuisines"
        value={preferredCuisine}
        onChangeText={setPreferredCuisine}
        style={{ marginBottom: 10 }}
      />

      <Button onPress={submitData} title="Save Profile" />

      <Button title="Go to Profile" onPress={() => router.push("/profile")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
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
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default EditProfile;
