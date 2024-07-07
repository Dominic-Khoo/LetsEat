import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, push, set, get } from 'firebase/database';
import { useRouter } from 'expo-router';
import eateries from '../../eateries.json';
import { FIREBASE_DB } from '../../firebaseConfig';

type Friend = {
    uid: string;
    email: string;
    username: string;
    profilePicture?: string;
};

type Eatery = {
    id: number;
    name: string;
    description: string;
    address: string;
    openingHours: {
        sunday: string;
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
    };
    coordinate: {
        latitude: number;
        longitude: number;
    };
    imageTab: string;
    imagePopup: string;
};

const TakeawayScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
    const [selectedEatery, setSelectedEatery] = useState<Eatery | null>(null);
    const [requestSentModalVisible, setRequestSentModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const friendsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/friendsList`);
        onValue(friendsRef, async (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const friendsList: Friend[] = await Promise.all(Object.keys(data).map(async key => {
                    const userRef = ref(FIREBASE_DB, `users/${key}`);
                    const userSnapshot = await get(userRef);
                    const userData = userSnapshot.val();
                    return {
                        uid: key,
                        email: data[key].email,
                        username: data[key].username,
                        profilePicture: userData?.profilePicture || null,
                    };
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
        if (selectedFriends.some(selected => selected.uid === friend.uid)) {
            setSelectedFriends(selectedFriends.filter(selected => selected.uid !== friend.uid));
        } else {
            setSelectedFriends([...selectedFriends, friend]);
        }
    };

    // Handle sending Takeaway Request
    const sendTakeawayRequests = async () => {
        if (!selectedEatery) {
            alert("Please select an eatery.");
            return;
        }

        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const requests = selectedFriends.map(friend => {
                const requestRef = ref(FIREBASE_DB, `users/${friend.uid}/takeawayRequests`);
                const newRequestRef = push(requestRef);
                return set(newRequestRef, {
                    requesterUid: currentUser.uid,
                    requesterEmail: currentUser.email,
                    requesterUsername: currentUser.displayName,
                    eatery: selectedEatery.name,
                    timestamp: Date.now(),
                });
            });

            await Promise.all(requests);
            console.log('Takeaway Requests sent successfully');
            setRequestSentModalVisible(true); // Show the success modal
            setSelectedFriends([]); // Clear selected friends
            setSelectedEatery(null); // Clear selected eatery
        } catch (error) {
            console.error('Error sending Takeaway Requests:', (error as Error).message);
        }
    };

    const isSelected = (friend: Friend) => selectedFriends.some(selected => selected.uid === friend.uid);

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
                {filteredFriends.length === 0 ? (
                    <Text style={styles.noFriendsText}>You currently have no friends on LetsEat!</Text>
                ) : (
                    filteredFriends.map((friend: Friend) => (
                        <TouchableOpacity key={friend.uid} style={styles.item} onPress={() => handleFriendClick(friend)}>
                            <View style={styles.friendInfo}>
                                <Image source={friend.profilePicture ? { uri: friend.profilePicture } : require('../../assets/images/defaultprofile.png')} style={styles.profilePicture} />
                                <Text style={styles.name}>{friend.username}</Text>
                            </View>
                            <View style={styles.selectionIndicatorContainer}>
                                <View style={[styles.selectionIndicator, isSelected(friend) && styles.selected]} />
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
            {selectedFriends.length > 0 && (
                <View style={styles.actionsContainer}>
                    <Text style={styles.selectedFriendText}>Where to Takeaway From?</Text>
                    <ScrollView style={styles.eateriesContainer}>
                        {eateries.map((eatery: Eatery) => (
                            <TouchableOpacity
                                key={eatery.id}
                                style={[styles.eateryItem, selectedEatery?.id === eatery.id && styles.selectedEatery]}
                                onPress={() => setSelectedEatery(eatery)}
                            >
                                <Text style={styles.eateryName}>{eatery.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={sendTakeawayRequests}
                    >
                        <Text style={styles.actionButtonText}>Ask for help from selected friends</Text>
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
    noFriendsText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        padding: 20,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 18,
        fontFamily: 'Poppins',
        color: '#333',
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 10,
    },
    selectionIndicatorContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'transparent',
    },
    selected: {
        backgroundColor: '#F87171',
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
    eateriesContainer: {
        maxHeight: 200,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        marginBottom: 10,
    },
    eateryItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    eateryName: {
        fontSize: 18,
        fontFamily: 'Poppins',
        color: '#333',
    },
    selectedEatery: {
        backgroundColor: '#F87171',
        color: '#fff',
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
