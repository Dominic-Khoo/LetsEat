import { Image, View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { icons } from "@/constants";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { FIREBASE_DB } from "../../../firebaseConfig";
import Daily from "./components/Daily";
import Streaks from "./components/Streaks";

const Home = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userRef = ref(FIREBASE_DB, `users/${currentUser.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.username) {
          setUsername(data.username);
        }
      });
    }
  }, []);

  return (
    <View>
      <View className=" bg-red-400 pt-5 pl-2 pr-2 pb-2">
        <Text className="text-2xl text-left pl-3 font-pblack">
          Hi, {username}!
        </Text>
      </View>
      <Daily />
      <View className=" pl-2 pr-2 pb-5"></View>

      <View className="flex-2 flex-row justify-space-between">
        <View style={{ backgroundColor: "#F87171", flex: 2, padding: 30 }}>
          <TouchableOpacity
            onPress={() => router.push("(tabs)/request")}
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "Poppins-SemiBold",
                fontSize: 16,
                marginRight: 8,
              }}
            >
              See new requests
            </Text>
            <Image source={icons.request} style={{ width: 24, height: 24 }} />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: "black", flex: 2, padding: 30 }}></View>
      </View>
      <Streaks />
    </View>
  );
};

export default Home;
