import React from "react";
import { Stack } from "expo-router";

const MapLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/ReviewScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="components/NearbyUsersScreen"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="components/PublicProfile"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default MapLayout;
