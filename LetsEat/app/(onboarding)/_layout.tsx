import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const OnboardingLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="Onboarding"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/SetUpAcc"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/OtherInfo"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/PreferredFood"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default OnboardingLayout;

const styles = StyleSheet.create({});
