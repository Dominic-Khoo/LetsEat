import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import { ref, onValue, remove, update, get } from "firebase/database";
import { FIREBASE_DB } from "../../../../firebaseConfig";
import { useRouter } from "expo-router";

type Friend = {
  uid: string;
  email: string;
  username: string;
  profilePicture?: string;
  isAvailable?: boolean;
};

const FriendsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [tabVisible, setTabVisible] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Fetch friends list
    const friendsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/friendsList`);
    onValue(friendsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const friendsList = Object.keys(data).map(async (key) => {
          const friendData = {
            uid: key,
            email: data[key].email,
            username: data[key].username,
          };

          // Fetch profile picture and availability status for each friend
          const userRef = ref(FIREBASE_DB, `users/${key}`);
          const userSnapshot = await get(userRef);
          const userData = userSnapshot.val();
          return {
            ...friendData,
            profilePicture: userData?.profilePicture || null,
            isAvailable: userData?.isAvailable || false,
          };
        });

        Promise.all(friendsList).then((friends) => {
          const sortedFriends = friends.sort((a, b) => {
            if (a.isAvailable === b.isAvailable) {
              return a.username.localeCompare(b.username);
            }
            return b.isAvailable - a.isAvailable;
          });
          setFriends(sortedFriends);
          setFilteredFriends(sortedFriends); // Initialize filtered friends
        });
      } else {
        setFriends([]);
        setFilteredFriends([]);
      }
    });
  }, []);

  const searchFriends = (query: string) => {
    if (!query) {
      setFilteredFriends(friends); // Reset to all friends if search query is empty
      return;
    }
    const filtered = friends.filter((friend) =>
      friend.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredFriends(filtered);
  };

  const handleFriendClick = (friend: Friend) => {
    // Handle friend click
    if (selectedFriend && selectedFriend.uid === friend.uid) {
      setSelectedFriend(null);
      setTabVisible(false);
    } else {
      setSelectedFriend(friend);
      setTabVisible(true);
    }
  };

  const handleViewProfile = () => {
    // Navigate to the friend's public profile screen
    if (selectedFriend) {
      router.push({
        pathname: "./social/components/PublicProfile",
        params: { uid: selectedFriend.uid },
      });
    }
  };

  const handleChat = () => {
    // Navigate to Chat screen
    if (selectedFriend) {
      router.push(`./social/components/Chat?friendUid=${selectedFriend.uid}`);
    }
  };

  const confirmRemoveFriend = () => {
    Alert.alert(
      "Remove Friend",
      "Are you sure you want to remove this friend?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: handleRemoveFriend },
      ],
      { cancelable: false }
    );
  };

  const handleRemoveFriend = async () => {
    // Handle removing friend
    if (selectedFriend) {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // Remove friend from current user's friend list
        const currentUserFriendsRef = ref(
          FIREBASE_DB,
          `users/${currentUser.uid}/friendsList/${selectedFriend.uid}`
        );
        await remove(currentUserFriendsRef);

        // Remove current user from friend's friend list
        const friendFriendsRef = ref(
          FIREBASE_DB,
          `users/${selectedFriend.uid}/friendsList/${currentUser.uid}`
        );
        await remove(friendFriendsRef);

        // Update friendsCount for current user
        const currentUserRef = ref(FIREBASE_DB, `users/${currentUser.uid}`);
        const currentUserSnapshot = await get(currentUserRef);
        const currentUserData = currentUserSnapshot.val();
        if (currentUserData) {
          const updatedFriendsCount = (currentUserData.friendsCount || 0) - 1;
          await update(currentUserRef, { friendsCount: updatedFriendsCount });
        }

        // Update friendsCount for selected friend
        const selectedFriendRef = ref(
          FIREBASE_DB,
          `users/${selectedFriend.uid}`
        );
        const selectedFriendSnapshot = await get(selectedFriendRef);
        const selectedFriendData = selectedFriendSnapshot.val();
        if (selectedFriendData) {
          const updatedFriendsCount =
            (selectedFriendData.friendsCount || 0) - 1;
          await update(selectedFriendRef, {
            friendsCount: updatedFriendsCount,
          });
        }

        console.log("Friend removed:", selectedFriend);
      } catch (error) {
        console.error("Error removing friend:", (error as Error).message);
      }
    }
    setSelectedFriend(null);
    setTabVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Friends List</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          autoCapitalize="none"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
        <TouchableOpacity
          onPress={() => searchFriends(searchQuery)}
          style={styles.searchButton}
        >
          <Image
            source={require("../../../../assets/icons/searchblack.png")}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.listContainer}>
        {filteredFriends.map((friend, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleFriendClick(friend)}
            >
              <View style={styles.profileContainer}>
                {friend.profilePicture ? (
                  <Image
                    source={{ uri: friend.profilePicture }}
                    style={styles.profilePicture}
                    onError={(e) => {
                      console.log(
                        "Error loading profile picture for",
                        friend.username,
                        e
                      );
                    }}
                  />
                ) : (
                  <View
                    style={[
                      styles.profilePicture,
                      styles.defaultProfilePicture,
                    ]}
                  >
                    <Text style={styles.defaultProfileText}>
                      {friend.username[0]}
                    </Text>
                  </View>
                )}
                {friend.isAvailable && <View style={styles.greenDot} />}
              </View>
              <Text style={styles.listText}>{friend.username}</Text>
            </TouchableOpacity>
            {selectedFriend &&
              selectedFriend.uid === friend.uid &&
              tabVisible && (
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={styles.tabButton}
                    onPress={handleViewProfile}
                  >
                    <Text style={styles.tabButtonText}>View Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={handleChat}
                  >
                    <Text style={styles.tabButtonText}>Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={confirmRemoveFriend}
                  >
                    <Text style={styles.tabButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 5,
    left: 5,
    zIndex: 1,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Poppins-SemiBold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
  },
  searchButton: {
    marginLeft: 10,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  listContainer: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 10,
    maxHeight: 300,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    position: "relative",
    marginRight: 15,
  },

  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "black",
    borderWidth: 1,
  },
  defaultProfilePicture: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
  },
  defaultProfileText: {
    fontSize: 18,
    color: "#fff",
  },

  greenDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: "#37FD12",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  listText: {
    fontSize: 16,
    fontFamily: "Poppins",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  chatButton: {
    backgroundColor: "brown",
    padding: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  tabButton: {
    backgroundColor: "black",
    padding: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  removeButton: {
    backgroundColor: "#ff004f",
    padding: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  tabButtonText: {
    color: "#fff",
    fontFamily: "Poppins",
  },
});

export default FriendsList;
