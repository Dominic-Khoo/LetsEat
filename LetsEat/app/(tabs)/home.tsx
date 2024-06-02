import { Image, View, Text, Button } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";
import { router } from "expo-router";

const Home = () => {
  return (
    <View>
      <View className="bg-red-400 rounded-1xl pt-5 pl-2 pr-2 pb-2">
        <Text className="text-2xl text-left pl-3 font-pblack">hi, (user)!</Text>
      </View>

      <View className="pt-5 pl-2 pr-2 pb-12">
        <Text className="text-xl text-left pl-3 font-pblack">
          Schedule for Today
        </Text>
      </View>

      <View className="pt-5 pl-2 pr-2 pb-12"></View>

      <View className="flex-2 flex-row justify-space-between pt-10">
        <View style={{ backgroundColor: "white", flex: 2, padding: 30 }}>
          <Button
            title="see new requests"
            onPress={() => router.push("(tabs)/request")}
          ></Button>
          <Image source={icons.request} className="w-6 h-6 justify-center" />
        </View>
        <View style={{ backgroundColor: "black", flex: 2, padding: 30 }}></View>
      </View>
    </View>
  );
};

export default Home;
