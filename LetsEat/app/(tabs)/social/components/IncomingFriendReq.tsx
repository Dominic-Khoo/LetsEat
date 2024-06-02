import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, update, remove, get } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

type FriendRequest = {
    requesterUid: string;
    requesterEmail: string;
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
                const formattedRequests = Object.keys(data).map(key => ({
                    requesterUid: data[key].requesterUid,
                    requesterEmail: data[key].requesterEmail,
                }));
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
            // Add requester to current user's friends list
            const currentUserFriendsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/friendsList/${request.requesterUid}`);
            await update(currentUserFriendsRef, { email: request.requesterEmail });

            // Add current user to requester's friends list
            const requesterFriendsRef = ref(FIREBASE_DB, `users/${request.requesterUid}/friendsList/${currentUser.uid}`);
            await update(requesterFriendsRef, { email: currentUser.email });

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
            <ScrollView style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Incoming Requests</Text>
                {requests.slice(0, 1).map((request, index) => (
                    <View key={index} style={styles.listItem}>
                        <Text style={styles.listText}>{request.requesterEmail}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.acceptButton} onPress={() => acceptFriendRequest(request)}>
                                <Text style={styles.buttonText}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.declineButton} onPress={() => declineFriendRequest(request)}>
                                <Text style={styles.buttonText}>Decline</Text>
                            </TouchableOpacity>
                        </View>
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
    listContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    listItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listText: {
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    acceptButton: {
        backgroundColor: '#007bff',
        padding: 5,
        borderRadius: 5,
        marginRight: 10,
    },
    declineButton: {
        backgroundColor: '#dc3545',
        padding: 5,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
    },
});

export default IncomingFriendReq;