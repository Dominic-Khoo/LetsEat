import React from "react";
import { Stack } from "expo-router";

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          
        }}
      />
      <Stack.Screen
        name="components/Leaderboards"
        options ={{
          headerShown: false,
        }}
      />     
      <Stack.Screen
        name="components/EventHistory"
        options = {{
          headerShown: false,
        }}
      />
    </Stack>

  );
};

export default HomeLayout;