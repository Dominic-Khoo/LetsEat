import { Text, View } from 'react-native'
import React from 'react'
import RequestButton from "./components/RequestButton";
import Schedule from "./components/Schedule";
import Incoming from "./components/IncomingRequests";

const Request = () => {
  return (
    <View className="flex-1">
      <View className ="bg-red-200 pt-5">
        <Text className ="text-2xl text-center h-12 font-pblack">Requests</Text>
      </View> 
      <Schedule></Schedule>
      <Incoming></Incoming>
      <RequestButton></RequestButton>
    </View>

  )
}

export default Request