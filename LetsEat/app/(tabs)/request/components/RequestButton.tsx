import { useState } from "react";
import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

const RequestButton = () => {
  const [modalVisible, setModalVisible] = useState(false);

  function sendRequest() {
    setModalVisible(true);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={sendRequest}>
        <Text style={styles.buttonText}>Send Request</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <BlurView style={styles.blurBG} intensity={50} tint="dark" />
            <View style={styles.popup}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButtonContainer}
              >
                <Image
                  source={require("../../../../assets/icons/close.png")}
                  style={styles.closeButtonIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.popupButton, styles.openJioButton]}
                onPress={() => {
                  setModalVisible(false);
                  router.push("/(eatrequests)/openjio");
                }}
              >
                <Text style={[styles.popupText]}>Open Jio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.popupButton, styles.bookingButton]}
                onPress={() => {
                  setModalVisible(false);
                  router.push("/(eatrequests)/booking");
                }}
              >
                <Text style={styles.popupText}>Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.popupButton, styles.takeawayButton]}
                onPress={() => {
                  setModalVisible(false);
                  router.push("/(eatrequests)/takeaway");
                }}
              >
                <Text style={styles.popupText}>Takeaway</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    padding: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: "#F87171",
    shadowOpacity: 0.3,
  },
  buttonText: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurBG: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popup: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    elevation: 5,
    width: "80%",
    alignItems: "center", // Ensure the content is centered
  },
  popupButton: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    width: "100%",
  },
  openJioButton: {
    backgroundColor: "#C04000",
    borderColor: "#C04000",
  },
  bookingButton: {
    backgroundColor: "#C04000",
    borderColor: "#C04000",
  },
  takeawayButton: {
    backgroundColor: "#C04000",
    borderColor: "#C04000",
  },
  popupText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
  closeButtonContainer: {
    position: "absolute",
    top: 8,
    right: 10,
  },
  closeButtonIcon: {
    width: 20,
    height: 20,
  },
});

export default RequestButton;
