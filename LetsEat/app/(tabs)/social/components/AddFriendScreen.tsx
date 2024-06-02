import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Text, Modal } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, push, set, get, child } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';
import { BlurView } from 'expo-blur';

type User = {
    uid: string;
    email: string;
};

const UserList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [Users, setUsers] = useState<User[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [tabVisible, setTabVisible] = useState<boolean>(false);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [friends, setFriends] = useState<User[]>([]);

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Fetch Users list
        const UsersRef = ref(FIREBASE_DB, `users/${currentUser.uid}/UsersList`);
        onValue(UsersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const UsersList = Object.keys(data).map(key => ({
                    uid: key,
                    email: data[key].email,
                }));
                setUsers(UsersList);
            } else {
                setUsers([]);
            }
        });

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
                    .filter(key => key !== currentUser.uid && users[key].email.toLowerCase().includes(query.toLowerCase()))
                    .map(key => ({ uid: key, email: users[key].email}));

                // Filter out users who are already friends or in the users list
                const filteredResults = results.filter(user => 
                    !Users.some(User => User.uid === user.uid) &&
                    !friends.some(friend => friend.uid === user.uid)
                );

                setSearchResults(filteredResults);
            }
        } catch (error) {
            console.error('Error searching users:', (error as Error).message);
        }
    };

    const handleUserClick = (User: User) => {
        // Handle User click
        if (selectedUser && selectedUser.uid === User.uid) {
            setSelectedUser(null);
            setTabVisible(false);
        } else {
            setSelectedUser(User);
            setTabVisible(true);
        }
    };

    const sendFriendRequest = async () => {
        // Handle sending User request
        if (selectedUser) {
            setSendingRequest(true);
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (!currentUser) return;
                    
                const requestRef = ref(FIREBASE_DB, `users/${selectedUser.uid}/incomingRequests`);
                const newRequestRef = push(requestRef);
                await set(newRequestRef, {
                    requesterUid: currentUser.uid,
                    requesterEmail: currentUser.email,
                });

                console.log('Friend request sent successfully to:', selectedUser.email);
                setModalVisible(true);
            } catch (error) {
                console.error('Error sending Friend request:', (error as Error).message);
            } finally {
                setSendingRequest(false);
            }
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
                <Button title="Search" onPress={() => searchUsers(searchQuery)} />
            </View>
            <ScrollView style={styles.listContainer}>
                {searchResults.map((User, index) => (
                    <View key={index}>
                        <TouchableOpacity style={styles.listItem} onPress={() => handleUserClick(User)}>
                            <Text style={styles.listText}>{User.email}</Text>
                        </TouchableOpacity>
                        {selectedUser && selectedUser.uid === User.uid && tabVisible && (
                            <View style={styles.tabContainer}>
                                <TouchableOpacity style={styles.tabButton} onPress={sendFriendRequest} disabled={sendingRequest}>
                                    <Text style={styles.tabButtonText}>Send Friend Request</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

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
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
    },
    listContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
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
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    tabButton: {
        backgroundColor: '#007bff',
        padding: 5,
        borderRadius: 5,
        marginLeft: 5,
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
});

export default UserList;
