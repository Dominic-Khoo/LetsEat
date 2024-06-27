import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Text, Modal, Image, Button } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, push, set, get, child } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

type User = {
    uid: string;
    email: string;
    username: string;
};

const UserList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [tabVisible, setTabVisible] = useState<boolean>(false);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [friends, setFriends] = useState<User[]>([]);
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
                const friendsList = Object.keys(data).map(key => ({
                    uid: key,
                    email: data[key].email,
                    username: data[key].username,
                }));
                setFriends(friendsList);
            } else {
                setFriends([]);
            }
        });
    }, []);

    const searchUsers = async (query: string) => {
        if (!query) return;
        setSearchResults([]);
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const dbRef = ref(FIREBASE_DB);
            const snapshot = await get(child(dbRef, 'users'));
            if (snapshot.exists()) {
                const users = snapshot.val();
                const results = Object.keys(users)
                    .filter(key => key !== currentUser.uid && (
                        users[key].username.toLowerCase().includes(query.toLowerCase()) ||
                        users[key].email.toLowerCase() === query.toLowerCase()
                    ))
                    .map(key => ({
                        uid: key,
                        email: users[key].email,
                        username: users[key].username,
                    }));

                // Filter out users who are already friends
                const filteredResults = results.filter(user => 
                    !friends.some(friend => friend.uid === user.uid)
                );

                setSearchResults(filteredResults);
            }
        } catch (error) {
            console.error('Error searching users:', (error as Error).message);
        }
    };

    const handleUserClick = (user: User) => {
        // Handle user click
        if (selectedUser && selectedUser.uid === user.uid) {
            setSelectedUser(null);
            setTabVisible(false);
        } else {
            setSelectedUser(user);
            setTabVisible(true);
        }
    };

    const sendFriendRequest = async () => {
        // Handle sending user request
        if (selectedUser) {
            setSendingRequest(true);
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (!currentUser) return;
    
                const dbRef = ref(FIREBASE_DB, `users/${currentUser.uid}`);
                const snapshot = await get(dbRef);
                if (snapshot.exists()) {
                    const currentUserData = snapshot.val();
                    const currentUsername = currentUserData.username;
    
                    const requestRef = ref(FIREBASE_DB, `users/${selectedUser.uid}/incomingRequests`);
                    const newRequestRef = push(requestRef);
                    await set(newRequestRef, {
                        requesterUid: currentUser.uid,
                        requesterEmail: currentUser.email,
                        requesterUsername: currentUsername,
                    });
    
                    console.log('Friend request sent successfully to:', selectedUser.email);
                    setModalVisible(true);
                } else {
                    console.error('Error: current user data not found');
                }
            } catch (error) {
                console.error('Error sending friend request:', (error as Error).message);
            } finally {
                setSendingRequest(false);
            }
        }
    };

    const viewProfile = () => {
        if (selectedUser) {
            router.push({ pathname: './PublicProfile', params: { uid: selectedUser.uid } });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Users List</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Users..."
                    autoCapitalize="none"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
                <TouchableOpacity onPress={() => searchUsers(searchQuery)} style={styles.searchButton}>
                    <Image source={require('../../../../assets/icons/searchblack.png')} style={styles.searchIcon} />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.listContainer}>
                {searchResults.map((user, index) => (
                    <View key={index}>
                        <TouchableOpacity style={styles.listItem} onPress={() => handleUserClick(user)}>
                            <Text style={styles.listText}>{user.username}</Text>
                        </TouchableOpacity>
                        {selectedUser && selectedUser.uid === user.uid && tabVisible && (
                            <View style={styles.tabContainer}>
                                <TouchableOpacity style={styles.profileButton} onPress={viewProfile}>
                                    <Text style={styles.tabButtonText}>View Profile</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.tabButton} onPress={sendFriendRequest} disabled={sendingRequest}>
                                    <Text style={styles.tabButtonText}>Send Friend Request</Text>
                                </TouchableOpacity>
                               
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView intensity={50} style={styles.blurContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Request sent successfully</Text>
                        <Button title="Close" onPress={() => setModalVisible(false)} />
                    </View>
                </BlurView>
            </Modal>
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
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 10,
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
        justifyContent: 'flex-end',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    tabButton: {
        backgroundColor: '#000000',
        padding: 5,
        borderRadius: 5,
        marginLeft: 5,
    },
    profileButton: {
        backgroundColor: '#f87171',
        padding: 5,
        borderRadius:5,
        marginLeft:5,
    },
    tabButtonText: {
        color: '#fff',
    },
    blurContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: 250,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    backButton: {
        borderRadius: 8,
        paddingVertical: 20,
        paddingHorizontal: 40,
        backgroundColor: '#F87171',
        marginTop: 10,
        marginHorizontal: 10,
        marginBottom: 10,

    },
    backButtonText: {
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Lato',
    },
});

export default UserList;
