import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, remove, update, get } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

type TabType = 'Open Jio' | 'Bookings' | 'Takeaway';

interface Request {
    id: string;
    type: TabType;
    message: string;
    requesterEmail: string;
    requesterUid: string;
    date?: string;
    time?: string;
}

interface Event {
    day: string;
    name: string;
    height: number;
}

const Incoming = () => {
    const [activeTab, setActiveTab] = useState<TabType>('Open Jio');
    const [requests, setRequests] = useState<{ [key in TabType]: Request[] }>({
        'Open Jio': [],
        'Bookings': [],
        'Takeaway': [],
    });
    const [uniqueRequestsCount, setUniqueRequestsCount] = useState<{ [key in TabType]: number }>({
        'Open Jio': 0,
        'Bookings': 0,
        'Takeaway': 0,
    });

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
                    type: 'Open Jio' as TabType,
                    message: data[key].requesterEmail, // Use email as the message
                    requesterEmail: data[key].requesterEmail,
                    requesterUid: data[key].requesterUid,
                }));

                const uniqueRequesters = new Set(openJioRequests.map(request => request.requesterUid));
                setUniqueRequestsCount(prevCounts => ({
                    ...prevCounts,
                    'Open Jio': uniqueRequesters.size,
                }));

                setRequests(prevRequests => ({
                    ...prevRequests,
                    'Open Jio': openJioRequests,
                }));
            }
        });

        const bookingRequestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/bookingRequests`);
        onValue(bookingRequestsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const bookingRequests = Object.keys(data).map(key => ({
                    id: key,
                    type: 'Bookings' as TabType,
                    message: `${data[key].requesterEmail} for ${new Date(data[key].date).toLocaleDateString()} at ${new Date(data[key].time).toLocaleTimeString()}`,
                    requesterEmail: data[key].requesterEmail,
                    requesterUid: data[key].requesterUid,
                    date: data[key].date,
                    time: data[key].time,
                }));

                const uniqueRequesters = new Set(bookingRequests.map(request => request.requesterUid));
                setUniqueRequestsCount(prevCounts => ({
                    ...prevCounts,
                    'Bookings': uniqueRequesters.size,
                }));

                setRequests(prevRequests => ({
                    ...prevRequests,
                    'Bookings': bookingRequests,
                }));
            }
        });
    }, []);

    const handleOpenJioAccept = async (type: TabType, id: string) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const currentUserUid = currentUser.uid;
        const currentUserEmail = currentUser.email;

        const acceptedRequest = requests[type].find(request => request.id === id);
        if (!acceptedRequest) return;

        const requesterUid = acceptedRequest.requesterUid;
        const requesterEmail = acceptedRequest.requesterEmail;

        const currentDate = new Date().toISOString().split('T')[0];

        const newEvent: Event = {
            day: currentDate,
            name: `Open Jio with ${requesterEmail}`,
            height: 50,
        };
        const newSenderEvent: Event = {
            day: currentDate,
            name: `Open Jio with ${currentUserEmail}`,
            height: 50,
        };

        const userAgendaRef = ref(FIREBASE_DB, `users/${currentUserUid}/agenda/${currentDate}`);
        const userAgendaSnapshot = await get(userAgendaRef);
        const userEvents: Event[] = userAgendaSnapshot.val() || [];

        const eventExists = userEvents.some((event: Event) => event.name === newEvent.name);
        if (!eventExists) {
            const updatedUserEvents = [...userEvents, newEvent];
            await update(ref(FIREBASE_DB, `users/${currentUserUid}/agenda`), { [currentDate]: updatedUserEvents });
        }

        const senderAgendaRef = ref(FIREBASE_DB, `users/${requesterUid}/agenda/${currentDate}`);
        const senderAgendaSnapshot = await get(senderAgendaRef);
        const senderEvents: Event[] = senderAgendaSnapshot.val() || [];

        const senderEventExists = senderEvents.some((event: Event) => event.name === newSenderEvent.name);
        if (!senderEventExists) {
            const updatedSenderEvents = [...senderEvents, newSenderEvent];
            await update(ref(FIREBASE_DB, `users/${requesterUid}/agenda`), { [currentDate]: updatedSenderEvents });
        }

        const requestsRef = ref(FIREBASE_DB, `users/${currentUserUid}/openJioRequests`);
        const snapshot = await get(requestsRef);
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const requestId = childSnapshot.key;
                const requestData = childSnapshot.val();
                if (requestData.requesterUid === requesterUid) {
                    const requestToRemoveRef = ref(FIREBASE_DB, `users/${currentUserUid}/openJioRequests/${requestId}`);
                    remove(requestToRemoveRef);
                }
            });
        }

        const updatedRequests = requests[type].filter(request => request.requesterUid !== requesterUid);
        setRequests(prevRequests => ({ ...prevRequests, [type]: updatedRequests }));

        const uniqueRequesters = new Set(updatedRequests.map(request => request.requesterUid));
        setUniqueRequestsCount(prevCounts => ({
            ...prevCounts,
            [type]: uniqueRequesters.size,
        }));
    };

    const handleBookingAccept = async (type: TabType, id: string) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;
    
        const currentUserUid = currentUser.uid;
        const currentUserEmail = currentUser.email;
        const currentDate = new Date().toISOString().split('T')[0];
    
        const acceptedRequest = requests[type].find(request => request.id === id);
        if (!acceptedRequest) { console.error("Accepted request not found"); return; }
    
        const requesterUid = acceptedRequest.requesterUid;
        const requesterEmail = acceptedRequest.requesterEmail;
    
        // Extract date and time from the accepted booking request
        const bookingDateTemp = acceptedRequest.date || '';
        const bookingDateTest = new Date(bookingDateTemp);
        const singaporeTime = bookingDateTest.toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
        const parts = singaporeTime.split(',')[0].split('/');
        const bookingDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        const bookingTime = acceptedRequest.time || '';
        console.log("Booking date:", bookingDate);

        const date = new Date(bookingTime);
        const formattedTime = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'Asia/Singapore' });
        console.log(formattedTime);
    
        // Create event names with both date, time, and user details
        const newEvent: Event = {
            day: bookingDate, // Use booking date instead of current date
            name: `Booking with ${requesterEmail} at ${formattedTime}`, // Include time and requester's email
            height: 50,
        };
        const newSenderEvent: Event = {
            day: bookingDate, // Use booking date instead of current date
            name: `Booking with ${currentUserEmail} at ${formattedTime}`, // Include time and current user's email
            height: 50,
        };
    
        const userAgendaRef = ref(FIREBASE_DB, `users/${currentUserUid}/agenda/${bookingDate}`);
        console.log("User agenda reference:", userAgendaRef.toString());
        const userAgendaSnapshot = await get(userAgendaRef);
        const userEvents: Event[] = userAgendaSnapshot.val() || [];
    
        const eventExists = userEvents.some((event: Event) => event.name === newEvent.name);
        if (!eventExists) {
            const updatedUserEvents = [...userEvents, newEvent];
            await update(ref(FIREBASE_DB, `users/${currentUserUid}/agenda`), { [bookingDate]: updatedUserEvents });
        }
    
        const senderAgendaRef = ref(FIREBASE_DB, `users/${requesterUid}/agenda/${bookingDate}`);
        const senderAgendaSnapshot = await get(senderAgendaRef);
        const senderEvents: Event[] = senderAgendaSnapshot.val() || [];
    
        const senderEventExists = senderEvents.some((event: Event) => event.name === newSenderEvent.name);
        if (!senderEventExists) {
            const updatedSenderEvents = [...senderEvents, newSenderEvent];
            await update(ref(FIREBASE_DB, `users/${requesterUid}/agenda`), { [bookingDate]: updatedSenderEvents });
        }
    
        // Remove the accepted booking request from the user's list of booking requests
        const requestsRef = ref(FIREBASE_DB, `users/${currentUserUid}/bookingRequests`);
        const snapshot = await get(requestsRef);
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const requestId = childSnapshot.key;
                const requestData = childSnapshot.val();
                if (requestId === id) {
                    const requestToRemoveRef = ref(FIREBASE_DB, `users/${currentUserUid}/bookingRequests/${requestId}`);
                    remove(requestToRemoveRef);
                }
            });
        }
    
        // Update state to reflect the removal of the accepted request
        const updatedRequests = requests[type].filter(request => request.id !== id);
        setRequests(prevRequests => ({ ...prevRequests, [type]: updatedRequests }));
    
        // Update the count of unique requesters
        const uniqueRequesters = new Set(updatedRequests.map(request => request.requesterUid));
        setUniqueRequestsCount(prevCounts => ({
            ...prevCounts,
            [type]: uniqueRequesters.size,
        }));
    };
    

    const handleDecline = async (type: TabType, id: string) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const requestToDecline = requests[type].find(request => request.id === id);
        if (!requestToDecline) return;

        const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/openJioRequests`);
        const snapshot = await get(requestsRef);
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const requestId = childSnapshot.key;
                const requestData = childSnapshot.val();
                if (requestData.requesterUid === requestToDecline.requesterUid) {
                    const requestToRemoveRef = ref(FIREBASE_DB, `users/${currentUser.uid}/openJioRequests/${requestId}`);
                    remove(requestToRemoveRef);
                }
            });
        }

        const updatedRequests = requests[type].filter(request => request.requesterUid !== requestToDecline.requesterUid);
        setRequests(prevRequests => ({ ...prevRequests, [type]: updatedRequests }));

        const uniqueRequesters = new Set(updatedRequests.map(request => request.requesterUid));
        setUniqueRequestsCount(prevCounts => ({
            ...prevCounts,
            [type]: uniqueRequesters.size,
        }));
    };
    const renderRequests = () => {
        const uniqueRequesters = new Set<string>();
        const uniqueRequests = requests[activeTab].filter(request => {
            if (uniqueRequesters.has(request.requesterUid)) {
                return false;
            } else {
                uniqueRequesters.add(request.requesterUid);
                return true;
            }
        });
    
        return uniqueRequests.map(request => (
            <View key={request.id} style={styles.requestItem}>
                <Text>{request.message}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => handleAcceptButton(activeTab, request.id)} style={styles.acceptButton}>
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDecline(activeTab, request.id)} style={styles.declineButton}>
                        <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ));
    };
    
    const handleAcceptButton = (tab: TabType, id: string) => {
        if (tab === 'Open Jio') {
            handleOpenJioAccept(tab, id);
        } else if (tab === 'Bookings') {
            handleBookingAccept(tab, id);
        }
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {(['Open Jio', 'Bookings', 'Takeaway'] as TabType[]).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab ? styles.activeTab : null]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={styles.tabText}>{tab} ({uniqueRequestsCount[tab]})</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView style={styles.requestContainer}>{renderRequests()}</ScrollView>
        </View>
    );    
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
        marginBottom: 10,
    },
    tab: {
        paddingVertical: 5,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: 'blue',
    },
    tabText: {
        fontSize: 16,
    },
    requestContainer: {
        flex: 1,
    },
    requestItem: {
        padding: 20,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
    },
    declineButton: {
        backgroundColor: '#F44336',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
    },
});

export default Incoming;