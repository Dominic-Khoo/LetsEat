import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, update, remove, get } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

type FriendRequest = {
    requesterUid: string;
    requesterEmail: string;
    requesterUsername: string;
};

const IncomingFriendReq = () => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Fetch incoming requests
        const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/incomingRequests`);
        onValue(requestsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const uniqueRequests = new Set();
                const formattedRequests = Object.keys(data).map(key => {
                    const request = data[key];
                    if (!uniqueRequests.has(request.requesterUid)) {
                        uniqueRequests.add(request.requesterUid);
                        return {
                            requesterUid: request.requesterUid,
                            requesterEmail: request.requesterEmail,
                            requesterUsername: request.requesterUsername,
                        };
                    }
                    return null;
                }).filter(request => request !== null) as FriendRequest[];

                setRequests(formattedRequests);
            } else {
                setRequests([]);
            }
        });
    }, []);

    const acceptFriendRequest = async (request: FriendRequest) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            // Fetch current user's username
            const currentUserRef = ref(FIREBASE_DB, `users/${currentUser.uid}`);
            const snapshot = await get(currentUserRef);
            if (!snapshot.exists()) {
                console.error('Current user data not found');
                return;
            }

            const currentUserData = snapshot.val();
            const currentUsername = currentUserData.username;

            // Add requester to current user's friends list
            const currentUserFriendsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/friendsList/${request.requesterUid}`);
            await update(currentUserFriendsRef, { email: request.requesterEmail, username: request.requesterUsername });

            // Add current user to requester's friends list
            const requesterFriendsRef = ref(FIREBASE_DB, `users/${request.requesterUid}/friendsList/${currentUser.uid}`);
            await update(requesterFriendsRef, { email: currentUser.email, username: currentUsername });

            // Remove all requests from the requester
            const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/incomingRequests`);
            const requestSnapshot = await get(requestsRef);
            if (requestSnapshot.exists()) {
                requestSnapshot.forEach((childSnapshot) => {
                    const requestId = childSnapshot.key;
                    const requestData = childSnapshot.val();
                    if (requestData.requesterUid === request.requesterUid) {
                        const requestToRemoveRef = ref(FIREBASE_DB, `users/${currentUser.uid}/incomingRequests/${requestId}`);
                        remove(requestToRemoveRef);
                    }
                });
            }

            // Update the state to remove the accepted requests
            setRequests(prevRequests => prevRequests.filter(req => req.requesterUid !== request.requesterUid));

            console.log('Friend request accepted:', request.requesterEmail);
        } catch (error) {
            console.error('Error accepting friend request:', (error as Error).message);
        }
    };

    const declineFriendRequest = async (request: FriendRequest) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            // Remove all requests from the requester
            const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/incomingRequests`);
            const snapshot = await get(requestsRef);
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const requestId = childSnapshot.key;
                    const requestData = childSnapshot.val();
                    if (requestData.requesterUid === request.requesterUid) {
                        const requestToRemoveRef = ref(FIREBASE_DB, `users/${currentUser.uid}/incomingRequests/${requestId}`);
                        remove(requestToRemoveRef);
                    }
                });
            }

            // Update the state to remove the declined requests
            setRequests(prevRequests => prevRequests.filter(req => req.requesterUid !== request.requesterUid));

            console.log('Friend request declined:', request.requesterEmail);
        } catch (error) {
            console.error('Error declining friend request:', (error as Error).message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Incoming Requests</Text>
            <View style={styles.requestsContainer}>
                {requests.length === 0 ? (
                    <Text style={styles.noRequestsText}>No incoming requests</Text>
                ) : (
                    <ScrollView>
                        {requests.map((request, index) => (
                            <View key={index} style={styles.requestItem}>
                                <Text style={styles.requestText}>{request.requesterUsername}</Text>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.iconButton} onPress={() => acceptFriendRequest(request)}>
                                        <Image source={require('../../../../assets/icons/check-mark.png')} style={styles.icon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconButton} onPress={() => declineFriendRequest(request)}>
                                        <Image source={require('../../../../assets/icons/close.png')} style={styles.icon} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
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
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 10,
    },
    requestsContainer: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        padding: 10,
        maxHeight: 300, // Adjust the height as needed
    },
    requestItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestText: {
        fontSize: 16,
        fontFamily: 'Poppins',
    },
    noRequestsText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        padding: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 10,
    },
    icon: {
        width: 24,
        height: 24,
    },
});

export default IncomingFriendReq;
