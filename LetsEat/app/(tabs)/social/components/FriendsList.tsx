import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, remove } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

type Friend = {
    uid: string;
    email: string;
    username: string;
};

const FriendsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [tabVisible, setTabVisible] = useState<boolean>(false);

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Fetch friends list
        const friendsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/friendsList`);
        onValue(friendsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const friendsList = Object.keys(data).map(key => ({
                    uid: key,
                    email: data[key].email,
                    username: data[key].username,
                })).sort((a, b) => a.username.localeCompare(b.username)); // Sort alphabetically
                setFriends(friendsList);
                setFilteredFriends(friendsList); // Initialize filtered friends
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
        const filtered = friends.filter(friend => friend.username.toLowerCase().includes(query.toLowerCase()));
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
        // Handle view profile action
        if (selectedFriend) {
            console.log('View profile:', selectedFriend);
            // Implement logic to view profile
        }
    };

    const confirmRemoveFriend = () => {
        Alert.alert(
            'Remove Friend',
            'Are you sure you want to remove this friend?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: handleRemoveFriend },
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
                const currentUserFriendsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/friendsList/${selectedFriend.uid}`);
                await remove(currentUserFriendsRef);

                // Remove current user from friend's friend list
                const friendFriendsRef = ref(FIREBASE_DB, `users/${selectedFriend.uid}/friendsList/${currentUser.uid}`);
                await remove(friendFriendsRef);

                console.log('Friend removed:', selectedFriend);
            } catch (error) {
                console.error('Error removing friend:', (error as Error).message);
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
                <TouchableOpacity onPress={() => searchFriends(searchQuery)} style={styles.searchButton}>
                    <Image source={require('../../../../assets/icons/searchblack.png')} style={styles.searchIcon} />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.listContainer}>
                {filteredFriends.map((friend, index) => (
                    <View key={index}>
                        <TouchableOpacity style={styles.listItem} onPress={() => handleFriendClick(friend)}>
                            <Text style={styles.listText}>{friend.username}</Text>
                        </TouchableOpacity>
                        {selectedFriend && selectedFriend.uid === friend.uid && tabVisible && (
                            <View style={styles.tabContainer}>
                                <TouchableOpacity style={styles.tabButton} onPress={handleViewProfile}>
                                    <Text style={styles.tabButtonText}>View Profile</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.removeButton} onPress={confirmRemoveFriend}>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'Poppins-SemiBold'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#000',
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
        borderColor: '#000',
        borderRadius: 10,
        maxHeight: 300,
    },
    listItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    listText: {
        fontSize: 16,
        fontFamily: 'Poppins',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    tabButton: {
        backgroundColor: '#000000',
        padding: 5,
        borderRadius: 5,
        marginLeft: 5,
    },
    removeButton: {
        backgroundColor: '#ff004f',
        padding: 5,
        borderRadius: 5,
        marginLeft: 5,
    },
    tabButtonText: {
        color: '#fff',
        fontFamily: 'Poppins',
    },
});

export default FriendsList;
