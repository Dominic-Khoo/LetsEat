import { View, Text } from "react-native";
import { Button } from "react-native-paper";
import React from "react";
import { FIREBASE_AUTH } from "@/firebaseConfig";


const Profile = () => {
  return (
    <View className="bg-red-200 pt-5">
      <Text className="text-2xl text-center h-12">Profile</Text>
      <Button onPress={() => FIREBASE_AUTH.signOut()}>
        <Text>Logout</Text>
      </Button>
    </View>
  );
};

export default Profile;
