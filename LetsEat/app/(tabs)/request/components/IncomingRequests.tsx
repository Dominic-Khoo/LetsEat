import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';
import IncomingOpenJio from './OJRequests';
import IncomingBookings from './BKRequests';
import IncomingTakeaway from './TWRequests';

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

interface IncomingProps {
    onRequestUpdate: () => void;
}

const Incoming: React.FC<IncomingProps> = ({ onRequestUpdate }) => {
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

        const requestsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/${type === 'Open Jio' ? 'openJioRequests' : type === 'Bookings' ? 'bookingRequests' : 'takeawayRequests'}`);

        const snapshot = await get(requestsRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const requests = Object.keys(data).map(key => ({
                id: key,
                type,
                message: data[key].message,
                requesterEmail: data[key].requesterEmail,
                requesterUid: data[key].requesterUid,
                requesterUsername: data[key].requesterUsername,
                date: data[key].date,
                time: data[key].time,
            }));

            // Count unique requests based on both requesterUid and time
            const uniqueRequests = new Set(requests.map(request => `${request.requesterUid}-${request.date}-${request.time}`));
            setUniqueRequestsCount(prevCounts => ({
                ...prevCounts,
                [type]: uniqueRequests.size,
            }));

            setRequests(prevRequests => ({
                ...prevRequests,
                [type]: requests,
            }));
        } else {
            setUniqueRequestsCount(prevCounts => ({
                ...prevCounts,
                [type]: 0,
            }));
        }
    };

    const handleTabPress = (tab: TabType) => {
        setActiveTab(tab);
        fetchRequests(tab);
    };

    const handleRequestUpdate = () => {
        fetchRequests(activeTab);
        onRequestUpdate();
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
                        <Text style={styles.tabText}>{tab}</Text>
                        {uniqueRequestsCount[tab] > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.badgeText}>{uniqueRequestsCount[tab]}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView style={styles.requestContainer}>
                {activeTab === 'Open Jio' && <IncomingOpenJio onRequestUpdate={handleRequestUpdate} />}
                {activeTab === 'Bookings' && <IncomingBookings onRequestUpdate={handleRequestUpdate} />}
                {activeTab === 'Takeaway' && <IncomingTakeaway onRequestUpdate={handleRequestUpdate} />}
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
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: 'darkred',
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold'
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -10,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    requestContainer: {
        flex: 1,
    },
});

export default Incoming;
