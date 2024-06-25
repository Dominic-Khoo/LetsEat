import React from "react";
import { Stack } from "expo-router";

const ProfileLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/EditProfile"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="components/UpdateImage"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default ProfileLayout;
