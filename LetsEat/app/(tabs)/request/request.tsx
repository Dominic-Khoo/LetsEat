import { Text, View, StyleSheet } from 'react-native';
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
      <View style={styles.container}>
        <Incoming onRequestUpdate={handleRequestUpdate} />
      </View>
      <RequestButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Request;
