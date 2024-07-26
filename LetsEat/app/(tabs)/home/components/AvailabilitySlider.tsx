import React, { useState, useEffect } from "react";
import { View, Switch, Text } from "react-native";
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
    <View>
      <Text>{isAvailable ? "Available to eat" : "Not available to eat"}</Text>
      <Switch onValueChange={toggleSwitch} value={isAvailable} />
    </View>
  );
};

export default AvailabilitySlider;
