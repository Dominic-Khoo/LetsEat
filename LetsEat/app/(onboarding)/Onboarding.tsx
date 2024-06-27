import {
  StyleSheet,
  Text,
  View,
  Image,
  Touchable,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import React from "react";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "@/firebaseConfig";
import Onboarding from "react-native-onboarding-swiper";
import { images } from "@/constants";
import { router } from "expo-router";

const OnboardingScreen = () => (
  <Onboarding
    onDone={() => {
      router.push("./components/SetUpAcc");
      console.log("Done");
    }}
    onSkip={() => {
      router.push("./components/SetUpAcc");
    }}
    pages={[
      {
        backgroundColor: "#e0a7a7",
        image: (
          <Image source={images.eating} className="w-80 h-60 object-contain" />
        ),
        title: "Welcome to Let's Eat",
        subtitle: "Find a meal buddy",
      },
      {
        backgroundColor: "#fff2e1",
        image: (
          <Image
            source={images.takefoodpic}
            className="w-60 h-60 object-contain"
          />
        ),
        title: "Let's get started",
        subtitle: "Ready to set up your profile?",
      },
    ]}
  />
);

export default OnboardingScreen;

const styles = StyleSheet.create({});
