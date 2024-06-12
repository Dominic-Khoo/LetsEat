import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { FIREBASE_AUTH } from "@/firebaseConfig";


const Profile = () => {
  return (
    <View style={styles.container}>
      <View className="bg-red-200 pt-5">
        <Text className="text-2xl text-center h-12 font-pblack">Profile</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={() => FIREBASE_AUTH.signOut()}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background color for the container
  },
  logoutButton: {
    backgroundColor: '#FFCACA', // Light red background color for the logout button
    padding: 10,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#000000', // Black text color for the logout button text
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});
