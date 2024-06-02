import { View, Text } from "react-native";
import { Button } from "react-native-paper";
import React from "react";
import { NavigationProp } from "@react-navigation/native";
import { FIREBASE_AUTH } from "@/firebaseConfig";

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Profile = ({ navigation }: RouterProps) => {
  return (
    <View className="bg-red-200 pt-20">
      <Text className="text-2xl text-center">Profile</Text>
      <Button onPress={() => FIREBASE_AUTH.signOut()}>
        <Text>Logout</Text>
      </Button>
    </View>
  );
};

export default Profile;
