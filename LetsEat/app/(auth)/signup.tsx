import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";
import { child, get, ref, set } from "firebase/database";
import { Link, router } from "expo-router";
import FormField from "../../components/FormField";
import CustomButton from "@/components/CustomButton";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const auth = FIREBASE_AUTH;
  const dbRef = ref(FIREBASE_DB);

  const signUp = async () => {
    setLoading(true);
    if (!email || !password || !username) {
      Alert.alert("Error", "Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      // Check if username exists
      const snapshot = await get(child(dbRef, `usernames/${username}`));
      if (snapshot.exists()) {
        console.log("Username already taken");
        Alert.alert("Username already taken");
        return;
      }

      // create a new user
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = response.user;
      console.log(user);

      // Send an email verification to the users email

      sendEmailVerification(user);
      Alert.alert("A verification email has been sent to your email address.");

      // Sign out the user
      signOut(auth);

      // Set the displayName
      await updateProfile(user, { displayName: username });

      // Store user data in Firebase Realtime Database
      await set(ref(FIREBASE_DB, `users/${user.uid}`), {
        email: user.email,
        username: username,
      });
      // Add username to the usernames node
      await set(ref(FIREBASE_DB, `usernames/${username}`), user.uid);

      console.log("User created and data stored:", response);
    } catch (error: any) {
      console.log(error);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("An account with this email already exists");
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white">
      <ScrollView>
        <View
          className="w-full h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Text className="text-2xl text-black font-psemibold">Register</Text>

          <FormField
            title="Username"
            value={username}
            handleChangeText={(e) => setUsername(e)}
            otherStyles="mt-7"
            placeholder={""}
            props={undefined}
          />

          <FormField
            title="Email"
            value={email}
            handleChangeText={(e) => setEmail(e)}
            otherStyles="mt-7"
            placeholder={""}
            props={undefined}
          />

          <FormField
            title="Password"
            value={password}
            handleChangeText={(e) => setPassword(e)}
            otherStyles="mt-7"
            placeholder={""}
            props={undefined}
          />

          <CustomButton
            title="Sign Up"
            handlePress={signUp}
            containerStyles="mt-7"
            isLoading={isSubmitting}
            textStyles={""}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-300 font-pregular">
              Have an account already?
            </Text>
            <Link href="/login" className="text-lg font-psemibold text-red-300">
              Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
