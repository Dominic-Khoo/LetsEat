import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";

export default function App() {
  return (
    <View className= "flex-1 items-center p-24">
        <Text className="text-4xl font-bold">Hello World</Text>
        <Text className="text-1xl">This is the first page of your app.</Text>
      <StatusBar style="auto" />
      <Link href ="/home" style ={{color: 'blue'}} > Go to Home</Link>

    </View>
  );
}


