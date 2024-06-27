import React, { useState, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Modal,
  Alert,
  TouchableOpacity,
  Text,
  ImageBackground,
} from "react-native";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FIREBASE_AUTH, storage } from "@/firebaseConfig";
import { FIREBASE_DB } from "@/firebaseConfig";
import { ref as ref2, get, set, update } from "firebase/database";
import { router } from "expo-router";
import { updateProfile } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import Icon from "react-native-vector-icons/FontAwesome";
import { images } from "@/constants";

const SetUpAcc = () => {
  const [bio, setBio] = useState("");

  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Get data of current user
  const user = FIREBASE_AUTH.currentUser;

  // Set the profile data
  const submitData = async () => {
    try {
      setLoading(true);
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
        }
        await update(ref2(FIREBASE_DB, `users/${user.uid}`), {
          profilePicture: profilePictureURL,
          bio: bio,
        });
      }
    } catch (error) {
      console.log("Error saving profile picture", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Text style={{ fontSize: 20, color: "black", fontWeight: "bold" }}>
          Set profile picture
        </Text>
        <View style={{ height: 15 }} />
        <TouchableOpacity
          style={[styles.button, styles.buttonClose]}
          onPress={() => {
            pickImage();
          }}
        >
          <Text style={styles.textStyle}>Choose photo</Text>
        </TouchableOpacity>
        <View style={{ height: 10 }} />

        <TouchableOpacity
          style={[styles.button, styles.buttonClose]}
          onPress={() => {
            handleCameraPermission();
          }}
        >
          <Text style={styles.textStyle}>Take photo</Text>
        </TouchableOpacity>
        <View style={{ height: 5 }} />

        {profilePicture && (
          <Image source={{ uri: profilePicture }} style={styles.image} />
        )}

        <View style={{ height: 50 }} />

        <Text style={{ fontSize: 20, color: "black", fontWeight: "bold" }}>
          Input bio
        </Text>
        <View style={{ height: 10 }} />

        <TextInput
          placeholder="Bio"
          placeholderTextColor="#888"
          value={bio}
          onChangeText={setBio}
          style={styles.input}
        />
        <View style={{ height: 80 }} />
      </View>

      <View style={styles.nextButton}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            submitData();
            router.push("./OtherInfo");
          }}
          disabled={loading}
        >
          <Icon name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.imageContainer}>
        <Image source={images.people} style={styles.imageBottom} />
      </View>
    </View>
  );
};

export default SetUpAcc;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#c8abc9",
    flex: 1,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },

  imageContainer: {
    alignItems: "center",
    marginTop: 50,
  },

  imageBottom: {
    width: 400,
    height: 100,
    resizeMode: "contain",
  },

  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#ddd",
    borderRadius: 50,
    marginBottom: 20,
  },

  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    shadowOpacity: 0.4,
  },

  buttonClose: {
    backgroundColor: "#825bd8",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 17,
  },

  saveButton: {
    backgroundColor: "#b59fe6",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    width: "60%",
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    color: "#000",
    textAlignVertical: "top",
  },
  nextButton: {
    alignItems: "flex-end",
    paddingHorizontal: 30,
  },
});
