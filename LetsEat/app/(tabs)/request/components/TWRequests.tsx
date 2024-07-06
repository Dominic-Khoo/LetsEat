import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, remove, get, push, set } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

interface Request {
    id: string;
    eatery: string;
    requesterEmail: string;
    requesterUid: string;
    requesterUsername: string;
}

interface Event {
    day: string;
    name: string;
    height: number;
    icon: string;
    type: string;
    uid: string;
    sharedEventId: string;
}

interface IncomingTakeawayProps {
    onRequestUpdate: () => void;
}

const IncomingTakeaway: React.FC<IncomingTakeawayProps> = ({ onRequestUpdate }) => {
    const [requests, setRequests] = useState<Request[]>([]);

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/takeawayRequests`);
        onValue(requestsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const takeawayRequests = Object.keys(data).map(key => ({
                    id: key,
                    eatery: data[key].eatery,
                    requesterEmail: data[key].requesterEmail,
                    requesterUid: data[key].requesterUid,
                    requesterUsername: data[key].requesterUsername,
                }));

                // Remove duplicate requests from the same person
                const uniqueRequests = takeawayRequests.filter((request, index, self) =>
                    index === self.findIndex((r) => r.requesterUid === request.requesterUid)
                );

                setRequests(uniqueRequests);
            }
        });
    }, []);

    const handleTakeawayAccept = async (id: string) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const currentUserUid = currentUser.uid;
        const currentUsername = currentUser.displayName;

        const acceptedRequest = requests.find(request => request.id === id);
        if (!acceptedRequest) return;

        const { requesterUid, requesterUsername, eatery } = acceptedRequest;

        // Convert the current date to Singapore timezone
        const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' };
        const currentDate = new Date().toLocaleDateString('en-CA', options);

        const sharedEventId = `${currentUserUid}_${requesterUid}_${Date.now()}`; // Generate a unique sharedEventId

        const newEvent: Event = {
            day: currentDate,
            name: `Takeaway from ${eatery} for ${requesterUsername}`,
            height: 50,
            icon: 'takeaway',
            type: 'Takeaway',
            uid: requesterUid,
            sharedEventId,
        };
        const newSenderEvent: Event = {
            day: currentDate,
            name: `Takeaway from ${eatery} by ${currentUsername}`,
            height: 50,
            icon: 'takeaway',
            type: 'Takeaway',
            uid: currentUserUid,
            sharedEventId,
        };

        try {
            // Fetch current events to check for duplicates
            const userEventsRef = ref(FIREBASE_DB, `users/${currentUserUid}/events`);
            const userEventsSnapshot = await get(userEventsRef);
            const userEvents = userEventsSnapshot.val() || {};

            const eventExists = Object.values(userEvents).some((event: unknown) => {
                const e = event as Event;
                return e.name === newEvent.name && e.day === newEvent.day;
            });

            if (!eventExists) {
                // Update the current user's events
                const newUserEventRef = push(userEventsRef);
                await set(newUserEventRef, newEvent);

                // Update the requester's events
                const senderEventsRef = ref(FIREBASE_DB, `users/${requesterUid}/events`);
                const newSenderEventRef = push(senderEventsRef);
                await set(newSenderEventRef, newSenderEvent);
            }

            // Remove all requests from the accepted requester
            const requestsRef = ref(FIREBASE_DB, `users/${currentUserUid}/takeawayRequests`);
            const snapshot = await get(requestsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const allRequests = Object.keys(data).map(key => ({
                    id: key,
                    requesterUid: data[key].requesterUid,
                }));

                const requestsToDelete = allRequests.filter(request => request.requesterUid === requesterUid);
                for (const request of requestsToDelete) {
                    await remove(ref(FIREBASE_DB, `users/${currentUserUid}/takeawayRequests/${request.id}`));
                }

                const updatedRequests = requests.filter(request => request.requesterUid !== requesterUid);
                setRequests(updatedRequests);
            }

            // Refresh agenda
            onRequestUpdate();

        } catch (error) {
            console.error("Error accepting Takeaway request:", error);
        }
    };

    const handleDecline = async (id: string) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const declinedRequest = requests.find(request => request.id === id);
        if (!declinedRequest) return;

        const { requesterUid } = declinedRequest;

        try {
            // Remove all requests from the declined requester
            const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/takeawayRequests`);
            const snapshot = await get(requestsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const allRequests = Object.keys(data).map(key => ({
                    id: key,
                    requesterUid: data[key].requesterUid,
                }));

                const requestsToDelete = allRequests.filter(request => request.requesterUid === requesterUid);
                for (const request of requestsToDelete) {
                    await remove(ref(FIREBASE_DB, `users/${currentUser.uid}/takeawayRequests/${request.id}`));
                }

                const updatedRequests = requests.filter(request => request.requesterUid !== requesterUid);
                setRequests(updatedRequests);
            }

            // Refresh agenda
            onRequestUpdate();

        } catch (error) {
            console.error("Error declining Takeaway request:", error);
        }
    };

    const renderRequests = () => {
        return requests.map(request => (
            <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestContent}>
                    <Image source={require('../../../../assets/icons/takeaway.png')} style={styles.leftIcon} />
                    <Text style={styles.requestText}>
                        <Text style={styles.boldText}>Takeaway from {request.eatery}</Text> for {request.requesterUsername}
                    </Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => handleTakeawayAccept(request.id)} style={styles.iconButton}>
                        <Image source={require('../../../../assets/icons/check-mark.png')} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDecline(request.id)} style={styles.iconButton}>
                        <Image source={require('../../../../assets/icons/close.png')} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.requestContainer}>
                {renderRequests()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    requestContainer: {
        flex: 1,
    },
    requestItem: {
        backgroundColor: '#ffd1df',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#000',
    },
    requestContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftIcon: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    requestText: {
        fontSize: 16,
        fontFamily: 'Poppins'
    },
    boldText: {
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    iconButton: {
        padding: 5,
    },
    icon: {
        width: 20,
        height: 20,
    },
});

export default IncomingTakeaway;
