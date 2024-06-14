import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, remove, update, get } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

interface Request {
    id: string;
    message: string;
    requesterEmail: string;
    requesterUid: string;
    requesterUsername: string;
}

interface Event {
    day: string;
    name: string;
    height: number;
    icon: string;
}

const IncomingOpenJio = () => {
    const [requests, setRequests] = useState<Request[]>([]);

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/openJioRequests`);
        onValue(requestsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const openJioRequests = Object.keys(data).map(key => ({
                    id: key,
                    message: "Open Jio with " + data[key].requesterUsername,
                    requesterEmail: data[key].requesterEmail,
                    requesterUid: data[key].requesterUid,
                    requesterUsername: data[key].requesterUsername,
                }));
                setRequests(openJioRequests);
            }
        });
    }, []);

    const handleOpenJioAccept = async (id: string) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const currentUserUid = currentUser.uid;
        const currentUsername = currentUser.displayName || '';

        const acceptedRequest = requests.find(request => request.id === id);
        if (!acceptedRequest) return;

        const { requesterUid, requesterUsername } = acceptedRequest;

        const currentDate = new Date().toISOString().split('T')[0];

        const newEvent: Event = {
            day: currentDate,
            name: `Open Jio with ${requesterUsername}`,
            height: 50,
            icon: 'eat',
        };
        const newSenderEvent: Event = {
            day: currentDate,
            name: `Open Jio with ${currentUsername}`,
            height: 50,
            icon: 'eat',
        };

        try {
            console.log("Starting transaction to accept Open Jio request");

            // Update the current user's agenda
            const userAgendaRef = ref(FIREBASE_DB, `users/${currentUserUid}/agenda/${currentDate}`);
            const userAgendaSnapshot = await get(userAgendaRef);
            const userEvents: Event[] = userAgendaSnapshot.val() ? Object.values(userAgendaSnapshot.val()) : [];

            console.log("Current user's events:", userEvents);

            const updatedUserEvents = userEvents.some(event => event.name === newEvent.name) ? userEvents : [...userEvents, newEvent];
            await update(ref(FIREBASE_DB, `users/${currentUserUid}/agenda`), { [currentDate]: updatedUserEvents });

            console.log("Updated current user's agenda:", updatedUserEvents);

            // Update the requester's agenda
            const senderAgendaRef = ref(FIREBASE_DB, `users/${requesterUid}/agenda/${currentDate}`);
            const senderAgendaSnapshot = await get(senderAgendaRef);
            const senderEvents: Event[] = senderAgendaSnapshot.val() ? Object.values(senderAgendaSnapshot.val()) : [];

            console.log("Requester's events:", senderEvents);

            const updatedSenderEvents = senderEvents.some(event => event.name === newSenderEvent.name) ? senderEvents : [...senderEvents, newSenderEvent];
            await update(ref(FIREBASE_DB, `users/${requesterUid}/agenda`), { [currentDate]: updatedSenderEvents });

            console.log("Updated requester's agenda:", updatedSenderEvents);

            // Remove the accepted request
            await remove(ref(FIREBASE_DB, `users/${currentUserUid}/openJioRequests/${id}`));

            console.log("Removed accepted request");

            // Update the state
            const updatedRequests = requests.filter(request => request.id !== id);
            setRequests(updatedRequests);

        } catch (error) {
            console.error("Error accepting Open Jio request:", error);
        }
    };

    const handleDecline = async (id: string) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const requestToDecline = requests.find(request => request.id === id);
        if (!requestToDecline) return;

        try {
            // Remove the declined request
            await remove(ref(FIREBASE_DB, `users/${currentUser.uid}/openJioRequests/${id}`));

            console.log("Removed declined request");

            // Update the state
            const updatedRequests = requests.filter(request => request.id !== id);
            setRequests(updatedRequests);

        } catch (error) {
            console.error("Error declining Open Jio request:", error);
        }
    };

    const renderRequests = () => {
        return requests.map(request => (
            <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestContent}>
                    <Image source={require('../../../../assets/icons/eat.png')} style={styles.leftIcon} />
                    <Text style={styles.requestText}>
                        <Text style={styles.boldText}>Open Jio</Text> with {request.requesterUsername}
                    </Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => handleOpenJioAccept(request.id)} style={styles.iconButton}>
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

export default IncomingOpenJio;
