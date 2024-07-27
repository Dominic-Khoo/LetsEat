import React, { useState, useEffect } from "react";
import { View, Switch, Text, StyleSheet } from "react-native";
import { FIREBASE_DB } from "@/firebaseConfig";
import { ref, onValue, update } from "firebase/database";
import { getAuth } from "firebase/auth";

const AvailabilitySlider = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      // Fetch initial availability status from Firebase
      const userAvailabilityRef = ref(
        FIREBASE_DB,
        `users/${currentUser.uid}/isAvailable`
      );
      const onValueChange = onValue(userAvailabilityRef, (snapshot) => {
        setIsAvailable(snapshot.val() || false);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const toggleSwitch = () => {
    if (!currentUser) return;

    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);

    // Update availability status in Firebase
    const userRef = ref(FIREBASE_DB, `users/${currentUser.uid}`);
    update(userRef, {
      isAvailable: newAvailability,
    }).catch((error) => {
      console.error("Error updating availability: ", error);
    });
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Available</Text>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isAvailable ? "#f5dd4b" : "#f4f3f4"}
        onValueChange={toggleSwitch}
        value={isAvailable}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#F87171",
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "white",
    marginRight: 10,
  },
});

export default AvailabilitySlider;
