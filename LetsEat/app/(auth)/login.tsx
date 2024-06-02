import {
  View,
  SafeAreaView,
  ScrollView,
  Image,
  Text,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Link } from "expo-router";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "@/components/CustomButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (error: any) {
      console.log(error);
      alert("Sign in failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white">
      <ScrollView>
        <View
          className="w-full h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[40-px] h-[250px]"
          />

          <Text className="text-2xl font-semibold text-black font-psemibold">
            Log in to LetsEat!
          </Text>

          <FormField
            title="Email"
            value={email}
            handleChangeText={(e) => setEmail(e)}
            otherStyles="mt-7"
            placeholder={""}
            props={undefined}
          />

          <FormField
            title="Password"
            value={password}
            handleChangeText={(e) => setPassword(e)}
            otherStyles="mt-7"
            placeholder={""}
            props={undefined}
          />

          <CustomButton
            title="Sign In"
            handlePress={signIn}
            containerStyles="mt-7"
            isLoading={isSubmitting}
            textStyles={""}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-300 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/signup"
              className="text-lg font-psemibold text-red-300"
            >
              Signup
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
