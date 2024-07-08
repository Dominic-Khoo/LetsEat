import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link, router } from "expo-router";
import CustomButton from "@/components/CustomButton";

const ForgetPasswordScreen = () => {
  const auth = FIREBASE_AUTH;
  const [email, setEmail] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const handlePasswordReset = async () => {
    if (email === "") {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent successfully");
      router.push("/login");
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text className="text-l text-left text-black font-pmedium ml-2 mb-2">
        Email address
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <CustomButton
        title="Reset Password"
        handlePress={handlePasswordReset}
        containerStyles="bg-red-400 min-h-[50px]"
        isLoading={isSubmitting}
        textStyles={""}
      />

      <Link
        href="/login"
        className="mt-5 text-l text-gray-500 text-center font-psemibold"
      >
        Back
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 60,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default ForgetPasswordScreen;
