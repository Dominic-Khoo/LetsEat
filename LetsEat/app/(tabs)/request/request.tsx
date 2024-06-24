import { Text, View } from 'react-native';
import React, { useState } from 'react';
import RequestButton from "./components/RequestButton";
import Schedule from "./components/Schedule";
import Incoming from "./components/IncomingRequests";

const Request = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <View className="flex-1">
      <View className="bg-red-200 pt-5">
        <Text className="text-2xl text-center h-12 font-pblack">Requests</Text>
      </View>
      <Schedule refreshTrigger= {refreshTrigger} />
      <Incoming onRequestUpdate={handleRequestUpdate} />
      <RequestButton />
    </View>
  );
};

export default Request;
