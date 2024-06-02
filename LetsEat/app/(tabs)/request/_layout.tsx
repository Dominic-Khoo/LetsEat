import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const ReqLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="request"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default ReqLayout;