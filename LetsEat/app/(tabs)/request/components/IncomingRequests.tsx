import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, remove, update, get } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';
import IncomingOpenJio from './OJRequests';
import IncomingBookings from './BKRequests';
import Takeaway from './TWRequests';

type TabType = 'Open Jio' | 'Bookings' | 'Takeaway';

interface Request {
    id: string;
    type: TabType;
    message: string;
    requesterEmail: string;
    requesterUid: string;
    requesterUsername: string;
    date?: string;
    time?: string;
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

    const fetchRequests = async (type: TabType) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/${type === 'Open Jio' ? 'openJioRequests' : 'bookingRequests'}`);

        const snapshot = await get(requestsRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const requests = Object.keys(data).map(key => ({
                id: key,
                type,
                message: data[key].requesterUsername,
                requesterEmail: data[key].requesterEmail,
                requesterUid: data[key].requesterUid,
                requesterUsername: data[key].requesterUsername,
                date: data[key].date,
                time: data[key].time,
            }));

            const uniqueRequesters = new Set(requests.map(request => request.requesterUid));
            setUniqueRequestsCount(prevCounts => ({
                ...prevCounts,
                [type]: uniqueRequesters.size,
            }));

            setRequests(prevRequests => ({
                ...prevRequests,
                [type]: requests,
            }));
        } else {
            setUniqueRequestsCount(prevCounts => ({
            ...prevCounts,
            [type]: 0,
        }))};
    };

    const handleTabPress = (tab: TabType) => {
        setActiveTab(tab);
        fetchRequests(tab);
    };

    useEffect(() => {
        fetchRequests('Open Jio');
        fetchRequests('Bookings');
        fetchRequests('Takeaway');
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {(['Open Jio', 'Bookings', 'Takeaway'] as TabType[]).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab ? styles.activeTab : null]}
                        onPress={() => handleTabPress(tab)}
                    >
                        <Text style={styles.tabText}>{tab} ({uniqueRequestsCount[tab]})</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView style={styles.requestContainer}>
                {activeTab === 'Open Jio' && <IncomingOpenJio />}
                {activeTab === 'Bookings' && <IncomingBookings />}
                {activeTab === 'Takeaway' && <Takeaway />}
            </ScrollView>
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
        borderBottomColor: 'darkred',
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold'
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
