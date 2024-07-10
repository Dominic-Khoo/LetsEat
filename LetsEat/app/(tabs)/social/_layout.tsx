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
        options={{ headerShown: false }}
      />
      <Stack.Screen name="components/Chat" options={{ headerShown: false }} />
      <Stack.Screen
        name="components/PublicProfile"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default SocialLayout;
