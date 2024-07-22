import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import FriendsList from "./components/FriendsList";
import IncomingFriendReq from "./components/IncomingFriendReq";
import { router } from "expo-router";

const Social = () => {
  return (
    <View className="flex-1">
      <View className="bg-red-200 pt-5">
        <Text className="text-2xl text-center h-12 font-pblack">Social</Text>
      </View>
      <FriendsList></FriendsList>
      <IncomingFriendReq></IncomingFriendReq>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("./social/components/AddFriendScreen")}
      >
        <Text style={styles.addButtonText}>Add Friend</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: "#F87171",
    marginHorizontal: 10,
    marginBottom: 10,
    shadowOpacity: 0.3,
  },
  addButtonText: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Lato",
    textAlign: "center",
  },
});

export default Social;
