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
    date: string;
    time: string;
}

interface Event {
    day: string;
    time: string;
    name: string;
    height: number;
    icon: string;
}

const formatDate = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    const time = new Date(timeString);

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    const ordinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}${ordinalSuffix(day)} ${month}, ${formattedHours}:${formattedMinutes} ${period}`;
};

const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${period}`;
};

const formatFirebaseDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
};

const sanitizeStringForFirebase = (str: string) => {
    return str.replace(/[.#$/[\]]/g, '_');
};

const IncomingBookings = () => {
    const [requests, setRequests] = useState<Request[]>([]);

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const bookingRequestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/bookingRequests`);
        onValue(bookingRequestsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const bookingRequests = Object.keys(data).map(key => ({
                    id: key,
                    message: `${data[key].requesterUsername} for ${new Date(data[key].date).toLocaleDateString()} at ${new Date(data[key].time).toLocaleTimeString()}`,
                    requesterEmail: data[key].requesterEmail,
                    requesterUid: data[key].requesterUid,
                    requesterUsername: data[key].requesterUsername,
                    date: data[key].date,
                    time: data[key].time,
                }));

                setRequests(bookingRequests);
            }
        });
    }, []);

    const handleBookingAccept = async (id: string) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const currentUserUid = currentUser.uid;
        const currentUsername = currentUser.displayName;

        const acceptedRequest = requests.find(request => request.id === id);
        if (!acceptedRequest) {
            console.error("Accepted request not found");
            return;
        }

        const { requesterUid, requesterUsername, date, time } = acceptedRequest;

        const firebaseDate = formatFirebaseDate(date);
        const formattedTime = formatTime(time);

        const newEvent: Event = {
            day: firebaseDate,
            time: formattedTime,
            name: `Booking with ${requesterUsername}`,
            height: 50,
            icon: 'reserved',
        };
        const newSenderEvent: Event = {
            day: firebaseDate,
            time: formattedTime,
            name: `Booking with ${currentUsername}`,
            height: 50,
            icon: 'reserved',
        };

        try {
            const sanitizedDate = sanitizeStringForFirebase(firebaseDate);
            const userAgendaRef = ref(FIREBASE_DB, `users/${currentUserUid}/agenda/${sanitizedDate}`);
            const userAgendaSnapshot = await get(userAgendaRef);
            const userEvents: Event[] = userAgendaSnapshot.val() || [];

            const updatedUserEvents = [...userEvents, newEvent];
            await update(ref(FIREBASE_DB, `users/${currentUserUid}/agenda`), { [sanitizedDate]: updatedUserEvents });

            const senderAgendaRef = ref(FIREBASE_DB, `users/${requesterUid}/agenda/${sanitizedDate}`);
            const senderAgendaSnapshot = await get(senderAgendaRef);
            const senderEvents: Event[] = senderAgendaSnapshot.val() || [];

            const updatedSenderEvents = [...senderEvents, newSenderEvent];
            await update(ref(FIREBASE_DB, `users/${requesterUid}/agenda`), { [sanitizedDate]: updatedSenderEvents });

            const requestsRef = ref(FIREBASE_DB, `users/${currentUserUid}/bookingRequests/${id}`);
            await remove(requestsRef);

            const updatedRequests = requests.filter(request => request.id !== id);
            setRequests(updatedRequests);
        } catch (error) {
            console.error("Error accepting booking request:", error);
        }
    };

    const handleDecline = async (id: string) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/bookingRequests/${id}`);
        await remove(requestsRef);

        const updatedRequests = requests.filter(request => request.id !== id);
        setRequests(updatedRequests);
    };

    const renderRequests = () => {
        return requests.map(request => (
            <View key={request.id} style={styles.requestItem }>
                <View style={styles.requestContent}>
                    <Image source={require('../../../../assets/icons/reserved.png')} style={styles.leftIcon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.timeText}>{formatDate(request.date, request.time)}</Text>
                        <Text style={styles.requestText}>
                            <Text style={styles.boldText}>Booking</Text> with {request.requesterUsername}
                        </Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => handleBookingAccept(request.id)} style={styles.iconButton}>
                            <Image source={require('../../../../assets/icons/check-mark.png')} style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDecline(request.id)} style={styles.iconButton}>
                            <Image source={require('../../../../assets/icons/close.png')} style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.requestContainer}>{renderRequests()}</ScrollView>
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
    textContainer: {
        flex: 1,
    },
    timeText: {
        fontSize: 16,
        color: '#000',
    },
    requestText: {
        fontSize: 16,
        color: '#000',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 5,
        marginLeft: 5,
    },
    icon: {
        width: 20,
        height: 20,
    },
    boldText: {
        fontWeight: 'bold'
    }
});

export default IncomingBookings;
