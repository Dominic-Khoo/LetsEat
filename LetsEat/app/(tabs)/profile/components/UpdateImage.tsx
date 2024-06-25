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
import { Dropdown } from "react-native-element-dropdown";
import BottomSheet from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import EditProfile from "./EditProfile";

const UpdateImage = () => {
  const [modalVisible, setModalVisible] = useState(true);

  const [profilePicture, setProfilePicture] = useState("");
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

  const handleDeletePhoto = async () => {
    if (user) {
      await updateProfile(user, {
        photoURL: "",
      });
      await router.back();
    }
  };

  // Set the profile data
  const submitData = async () => {
    try {
      let profilePictureURL = "";

      if (user) {
        if (profilePicture != "") {
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
        } else {
          console.log("Profile picture removed");
          updateProfile(user, {
            photoURL: "",
          });
        }
      }
    } catch (error) {
      console.log("Error saving profile picture", error);
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={styles.modalView}>
            <View style={{ height: 10 }} />
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(!modalVisible);
                pickImage();
              }}
            >
              <Text style={styles.textStyle}>Choose photo</Text>
            </TouchableOpacity>
            <View style={{ height: 10 }} />

            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(!modalVisible);
                handleCameraPermission();
              }}
            >
              <Text style={styles.textStyle}>Take photo</Text>
            </TouchableOpacity>
            <View style={{ height: 5 }} />
            <View style={{ height: 5 }} />

            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(!modalVisible);
                handleDeletePhoto();
              }}
            >
              <Text style={styles.textStyle}>Delete photo</Text>
            </TouchableOpacity>
            <View style={{ height: 5 }} />

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={{ fontSize: 15, color: "#66545e" }}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={{ height: 10 }} />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          submitData();
        }}
      >
        <Text style={{ fontSize: 14, fontFamily: "Poppins-SemiBold" }}>
          Save Profile Picture
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("./EditProfile")}
      >
        <View style={{ height: 5 }} />
        <Text style={{ fontSize: 12, color: "#66545e" }}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UpdateImage;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
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
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 50,
    paddingHorizontal: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },

  buttonClose: {
    backgroundColor: "#ff6f69",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 17,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
  },

  saveButton: {
    backgroundColor: "#FFCACA",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
