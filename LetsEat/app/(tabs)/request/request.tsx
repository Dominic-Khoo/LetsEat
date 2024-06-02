import { Text, View, StyleSheet} from 'react-native'
import React from 'react'
import RequestButton from "./components/RequestButton";
import Schedule from "./components/Schedule";
import Incoming from "./components/IncomingRequests";

const Request = () => {
  return (
    <View className="flex-1">
      <View className ="bg-red-200 pt-10">
        <Text className ="text-2xl text-center">Request</Text>
      </View> 
      <Schedule></Schedule>
      <Incoming></Incoming>
      <RequestButton></RequestButton>
    </View>

  )
}

export default Request