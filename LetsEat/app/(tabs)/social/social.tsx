import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import FriendsList from './components/FriendsList';
import IncomingFriendReq from './components/IncomingFriendReq';
import { router } from 'expo-router';

const Social = () => {
  return (
    <View className ="flex-1">
        <View className ="bg-red-200 pt-20">
            <Text className ="text-2xl text-center">Social</Text> 
        </View>
      <FriendsList></FriendsList>
      <IncomingFriendReq></IncomingFriendReq>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('./social/components/AddFriendScreen')}>
                <Text style={styles.addButtonText}>Add Friend</Text>
            </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    addButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 50,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Social;