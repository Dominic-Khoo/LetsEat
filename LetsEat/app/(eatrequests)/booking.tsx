import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

type Friend = {
    uid: string;
    email: string;
};

const BookingScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [requestSentModalVisible, setRequestSentModalVisible] = useState(false);
    const router = useRouter();

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
        const filtered = friends.filter((friend: Friend) =>
            friend.email.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredFriends(filtered);
    };

    // Handle friend click
    const handleFriendClick = (friend: Friend) => {
        setSelectedFriend(friend);
    };

    // Handle routing to the booking details screen
    const setBookingDetails = (friend: Friend) => {
        router.push({ pathname: './bookingdetails', params: { friend: JSON.stringify(friend) } });
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search friends..."
                onChangeText={handleSearch}
                value={searchQuery}
            />
            <ScrollView style={styles.friendsContainer}>
                {filteredFriends.map((friend: Friend) => (
                    <TouchableOpacity key={friend.uid} style={styles.item} onPress={() => handleFriendClick(friend)}>
                        <Text style={styles.name}>{friend.email}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {selectedFriend && (
                <View style={styles.actionsContainer}>
                    <Text style={styles.selectedFriendText}>Actions for {selectedFriend.email}:</Text>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setBookingDetails(selectedFriend)}
                    >
                        <Text style={styles.actionButtonText}>Set Booking Details</Text>
                    </TouchableOpacity>
                </View>
            )}
            <Modal animationType="slide" transparent={true} visible={requestSentModalVisible}>
                <TouchableWithoutFeedback onPress={() => setRequestSentModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
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
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    friendsContainer: {
        maxHeight: 300,
        borderWidth: 1,
        borderColor: '#ccc',
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
        color: '#333',
    },
    actionsContainer: {
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    selectedFriendText: {
        fontSize: 16,
        marginBottom: 10,
    },
    actionButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 10,
        marginVertical: 5,
    },
    actionButtonText: {
        color: '#fff',
        textAlign: 'center',
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
    },
    modalText: {
        fontSize: 18,
        textAlign: 'center',
    },
});

export default BookingScreen;