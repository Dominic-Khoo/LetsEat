import { Image, View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from "react";
import { icons } from "@/constants";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { ref, onValue, get } from "firebase/database";
import { FIREBASE_DB } from "../../../firebaseConfig";
import Daily from "./components/Daily";
import Streaks from "./components/Streaks";

const Home = () => {
  const [username, setUsername] = useState("");
  const [hasRequests, setHasRequests] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [uniqueRequestCount, setUniqueRequestCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const checkModalStatus = async () => {
      const modalShown = await AsyncStorage.getItem('modalShown');
      return modalShown === 'true';
    };

    const setModalStatus = async () => {
      await AsyncStorage.setItem('modalShown', 'true');
    };

    if (currentUser) {
      const userRef = ref(FIREBASE_DB, `users/${currentUser.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.username) {
          setUsername(data.username);
        }
      });

      const checkRequests = async (path: string) => {
        const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/${path}`);
        const snapshot = await get(requestsRef);
        if (snapshot.exists()) {
          const requestData = snapshot.val();
          const uniqueRequesters = new Set(Object.values(requestData).map((request: any) => request.requesterUid));
          const requestCount = uniqueRequesters.size;
          if (requestCount > 0) {
            setHasRequests(true);
            setUniqueRequestCount(prevCount => prevCount + requestCount);
          }
        }
      };

      const fetchRequests = async () => {
        await checkRequests('openJioRequests');
        await checkRequests('bookingRequests');
        await checkRequests('takeawayRequests');

        const modalAlreadyShown = await checkModalStatus();
        if (!modalAlreadyShown) {
          setModalVisible(true);
          setModalStatus();
        }
      };

      fetchRequests();
    }
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View className="bg-red-400 pt-5 pl-2 pr-2 pb-2">
        <Text className="text-2xl text-left pl-3 font-pblack">
          Hi, {username}!
        </Text>
      </View>
      <View className="flex-1">
        <Daily />
        <View className="pl-2 pr-2"></View>
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
              {hasRequests && (
                <View style={styles.exclamationContainer}>
                  <Text style={styles.exclamationText}>!</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: "black", flex: 2, padding: 30 }}>
            <TouchableOpacity
              onPress={() => router.push("(tabs)/map")}
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
                Places to makan
              </Text>
              <Image source={require('../../../assets/icons/placeholder.png')} style={{ width: 28, height: 28 }} />
            </TouchableOpacity>
          </View>
        </View>
        <Streaks />
        <TouchableOpacity
          onPress={() => router.push("(tabs)/home/components/Leaderboards")}
          style={styles.leaderboardsButton}
        >
          <Text style={styles.leaderboardsButtonText}>View Leaderboards</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Welcome back, {username}!</Text>
            {uniqueRequestCount > 0 ? (
              <>
                <Text style={styles.modalText}>You have {uniqueRequestCount} incoming requests!</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    router.push("(tabs)/request");
                  }}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Go to Requests</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalText}>You have no incoming requests, let's go makan with someone!</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  exclamationContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exclamationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaderboardsButton: {
    backgroundColor: "black",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 5,
  },
  leaderboardsButtonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontFamily: 'Poppins',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalHeader: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#F87171',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default Home;
