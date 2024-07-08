import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, update, remove, get } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';
import { useRouter } from 'expo-router';

type FriendRequest = {
    requesterUid: string;
    requesterEmail: string;
    requesterUsername: string;
    profilePicture?: string;
};

const IncomingFriendReq = () => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Fetch incoming requests
        const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/incomingRequests`);
        onValue(requestsRef, async (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const uniqueRequests = new Set();
                const formattedRequests = await Promise.all(Object.keys(data).map(async key => {
                    const request = data[key];
                    if (!uniqueRequests.has(request.requesterUid)) {
                        uniqueRequests.add(request.requesterUid);

                        // Fetch profile picture for each requester
                        const userRef = ref(FIREBASE_DB, `users/${request.requesterUid}`);
                        const userSnapshot = await get(userRef);
                        const userData = userSnapshot.val();

                        return {
                            requesterUid: request.requesterUid,
                            requesterEmail: request.requesterEmail,
                            requesterUsername: request.requesterUsername,
                            profilePicture: userData?.profilePicture || null,
                        };
                    }
                    return null;
                }));

                setRequests(formattedRequests.filter(request => request !== null) as FriendRequest[]);
            } else {
                setRequests([]);
            }
        });
    }, []);

    const incrementFriendsCount = async (userUid: string) => {
        const userRef = ref(FIREBASE_DB, `users/${userUid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const currentCount = userData.friendsCount || 0;
            await update(userRef, { friendsCount: currentCount + 1 });
        }
    };

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

            // Increment friendsCount for both users
            await incrementFriendsCount(currentUser.uid);
            await incrementFriendsCount(request.requesterUid);

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
                                <TouchableOpacity
                                    style={styles.requestInfo}
                                    onPress={() => router.push({ pathname: './social/components/PublicProfile', params: { uid: request.requesterUid } })}
                                >
                                    {request.profilePicture ? (
                                        <Image
                                            source={{ uri: request.profilePicture }}
                                            style={styles.profilePicture}
                                            onError={(e) => {
                                                console.log('Error loading profile picture for', request.requesterUsername, e);
                                            }}
                                        />
                                    ) : (
                                        <View style={[styles.profilePicture, styles.defaultProfilePicture]}>
                                            <Text style={styles.defaultProfileText}>{request.requesterUsername[0]}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.requestText}>{request.requesterUsername}</Text>
                                </TouchableOpacity>
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
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 10,
    },
    defaultProfilePicture: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ccc',
    },
    defaultProfileText: {
        fontSize: 18,
        color: '#fff',
    },
});

export default IncomingFriendReq;

