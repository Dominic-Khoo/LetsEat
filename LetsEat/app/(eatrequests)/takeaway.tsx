import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, push, set } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';
import { router } from 'expo-router';

type Friend = {
    uid: string;
    email: string;
    username: string;
};

const TakeawayScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [location, setLocation] = useState('');
    const [requestSentModalVisible, setRequestSentModalVisible] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const friendsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/friendsList`);
        onValue(friendsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const friendsList = Object.keys(data).map(key => ({
                    uid: key,
                    email: data[key].email,
                    username: data[key].username,
                }));
                setFriends(friendsList);
                setFilteredFriends(friendsList); // Initialize filtered friends list
            } else {
                setFriends([]);
                setFilteredFriends([]);
            }
        });
    }, []);

    // Update filtered friends based on search query
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query) {
            setFilteredFriends(friends); // Reset to all friends if search query is empty
            return;
        }
        const filtered = friends.filter((friend: Friend) =>
            friend.username.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredFriends(filtered);
    };

    // Handle friend click
    const handleFriendClick = (friend: Friend) => {
        setSelectedFriend(friend);
    };

    // Handle sending Takeaway Request
    const sendTakeawayRequest = async (friend: Friend) => {
        if (!location) {
            alert("Please enter a location.");
            return;
        }

        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const requestRef = ref(FIREBASE_DB, `users/${friend.uid}/takeawayRequests`);
            const newRequestRef = push(requestRef);
            await set(newRequestRef, {
                requesterUid: currentUser.uid,
                requesterEmail: currentUser.email,
                requesterUsername: currentUser.displayName,
                location: location,
                timestamp: Date.now(),
            });
            console.log('Takeaway Request sent successfully to:', friend.email);
            setRequestSentModalVisible(true); // Show the success modal
            setLocation(''); // Clear the location input
            setSelectedFriend(null); // Clear the selected friend
        } catch (error) {
            console.error('Error sending Takeaway Request:', (error as Error).message);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Image source={require('../../assets/icons/back.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.header}>Ask for Help!</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search friends..."
                onChangeText={handleSearch}
                value={searchQuery}
            />
            <ScrollView style={styles.friendsContainer}>
                {filteredFriends.map((friend: Friend) => (
                    <TouchableOpacity key={friend.uid} style={styles.item} onPress={() => handleFriendClick(friend)}>
                        <Text style={styles.name}>{friend.username}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {selectedFriend && (
                <View style={styles.actionsContainer}>
                    <Text style={styles.selectedFriendText}>Where to Takeaway From?</Text>
                    <TextInput
                        style={styles.locationInput}
                        placeholder="Enter location..."
                        onChangeText={setLocation}
                        value={location}
                    />
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => sendTakeawayRequest(selectedFriend)}
                    >
                        <Text style={styles.actionButtonText}>Ask {selectedFriend.username} for help!</Text>
                    </TouchableOpacity>
                </View>
            )}
            <Modal animationType="slide" transparent={true} visible={requestSentModalVisible}>
                <TouchableWithoutFeedback onPress={() => setRequestSentModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity onPress={() => setRequestSentModalVisible(false)} style={styles.closeButtonContainer}>
                            </TouchableOpacity>
                            <Text style={styles.modalText}>Request Sent Successfully!</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
    },
    backButton: {
        position: 'absolute',
        top: 5,
        left: 5,
        zIndex: 1,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    header: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 10,
        textAlign: 'center',
    },
    searchInput: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    friendsContainer: {
        maxHeight: 300,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        marginBottom: 10,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    name: {
        fontSize: 18,
        fontFamily: 'Poppins',
        color: '#333',
    },
    actionsContainer: {
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    selectedFriendText: {
        fontSize: 16,
        fontFamily: 'Poppins',
        marginBottom: 10,
    },
    locationInput: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    actionButton: {
        padding: 10,
        backgroundColor: '#F87171',
        borderRadius: 10,
        marginVertical: 5,
    },
    actionButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Poppins',
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
    },
    modalText: {
        fontSize: 18,
        textAlign: 'center',
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    closeButtonIcon: {
        width: 24,
        height: 24,
    },
});

export default TakeawayScreen;
