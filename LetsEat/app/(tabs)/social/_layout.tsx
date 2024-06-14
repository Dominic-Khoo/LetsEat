import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const SocialLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          
        }}
      />
      <Stack.Screen 
        name="components/AddFriendScreen"
        options={{ headerShown: false }} />
    </Stack>
  );
};

export default SocialLayout;