import {
  View,
  SafeAreaView,
  ScrollView,
  Image,
  Text,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, router } from "expo-router";
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
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      setLoading(false);
      return;
    }
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      const user = response.user;

      // Check if user has verified their email
      if (user.emailVerified == false) {
        Alert.alert("Error", "Please verify your email address");
        router.push("/login");
      }
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert("Your email or password was incorrect");
      } else {
        Alert.alert("Error", error.message);
      }
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
            source={images.logotry}
            resizeMode="contain"
            className="ml-20 w-[200px] h-[230px]"
          />

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

          <View>
            <Link
              href="/forgotpassword"
              className="text-m text-right pt-2 text-gray-400"
            >
              Forgot Password?
            </Link>
          </View>

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
