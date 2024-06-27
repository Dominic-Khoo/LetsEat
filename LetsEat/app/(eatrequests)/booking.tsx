import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

type Friend = {
    uid: string;
    email: string;
    username: string;
    faculty: string;
    campusAccomodation: string;
};

const BookingScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
    const [facultyRecommendations, setFacultyRecommendations] = useState<Friend[]>([]);
    const [campusRecommendations, setCampusRecommendations] = useState<Friend[]>([]);
    const [filteredFacultyRecommendations, setFilteredFacultyRecommendations] = useState<Friend[]>([]);
    const [filteredCampusRecommendations, setFilteredCampusRecommendations] = useState<Friend[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
    const [requestSentModalVisible, setRequestSentModalVisible] = useState(false);
    const [facultyExpanded, setFacultyExpanded] = useState(false);
    const [campusExpanded, setCampusExpanded] = useState(false);
    const [facultyName, setFacultyName] = useState('');
    const [campusName, setCampusName] = useState('');
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const friendsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/friendsList`);
        onValue(friendsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const friendsList = Object.keys(data).map(key => ({
                    uid: key,
                    email: data[key].email,
                    username: data[key].username,
                    faculty: data[key].faculty || '',
                    campusAccomodation: data[key].campusAccomodation || '',
                }));
                setFriends(friendsList);
                setFilteredFriends(friendsList); // Initialize filtered friends list
            } else {
                setFriends([]);
                setFilteredFriends([]);
            }
        });

        const userRef = ref(FIREBASE_DB, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                const faculty = userData.faculty;
                const campusAccomodation = userData.campusAccomodation;
                setFacultyName(faculty);
                setCampusName(campusAccomodation);

                const allUsersRef = ref(FIREBASE_DB, `users`);
                onValue(allUsersRef, (allSnapshot) => {
                    const allUsersData = allSnapshot.val();
                    if (allUsersData) {
                        const allUsers = Object.keys(allUsersData).map(key => ({
                            uid: key,
                            email: allUsersData[key].email,
                            username: allUsersData[key].username,
                            faculty: allUsersData[key].faculty,
                            campusAccomodation: allUsersData[key].campusAccomodation,
                        }));

                        const isFriend = (uid: string) => friends.some(friend => friend.uid === uid);

                        const facultyRecommendedUsers = allUsers.filter(user =>
                            user.faculty === faculty &&
                            !isFriend(user.uid) &&
                            user.uid !== currentUser.uid
                        );

                        const campusRecommendedUsers = allUsers.filter(user =>
                            user.campusAccomodation === campusAccomodation &&
                            !isFriend(user.uid) &&
                            user.uid !== currentUser.uid
                        );

                        setFacultyRecommendations(facultyRecommendedUsers);
                        setFilteredFacultyRecommendations(facultyRecommendedUsers);
                        setCampusRecommendations(campusRecommendedUsers);
                        setFilteredCampusRecommendations(campusRecommendedUsers);
                    }
                });
            }
        });
    }, []);

    // Update filtered friends and recommendations based on search query
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query) {
            setFilteredFriends(friends); // Reset to all friends if search query is empty
            setFilteredFacultyRecommendations(facultyRecommendations); // Reset to all faculty recommendations if search query is empty
            setFilteredCampusRecommendations(campusRecommendations); // Reset to all campus recommendations if search query is empty
            return;
        }
        const filteredFriends = friends.filter((friend: Friend) =>
            friend.username.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredFriends(filteredFriends);

        const filteredFaculty = facultyRecommendations.filter((user: Friend) =>
            user.username.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredFacultyRecommendations(filteredFaculty);

        const filteredCampus = campusRecommendations.filter((user: Friend) =>
            user.username.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCampusRecommendations(filteredCampus);
    };

    // Handle friend click
    const handleFriendClick = (friend: Friend) => {
        if (selectedFriends.some(selected => selected.uid === friend.uid)) {
            setSelectedFriends(selectedFriends.filter(selected => selected.uid !== friend.uid));
        } else {
            setSelectedFriends([...selectedFriends, friend]);
        }
    };

    // Handle routing to the booking details screen
    const setBookingDetails = () => {
        router.push({ pathname: './bookingdetails', params: { friends: JSON.stringify(selectedFriends) } });
    };

    const isSelected = (friend: Friend) => selectedFriends.some(selected => selected.uid === friend.uid);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Image source={require('../../assets/icons/back.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.header}>Who to Book?</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search friends..."
                onChangeText={handleSearch}
                value={searchQuery}
            />
            <Text style={styles.subHeader}>Friends List</Text>
            <ScrollView style={styles.friendsContainer}>
                {filteredFriends.map((friend: Friend) => (
                    <TouchableOpacity key={friend.uid} style={styles.item} onPress={() => handleFriendClick(friend)}>
                        <Text style={styles.name}>{friend.username}</Text>
                        <View style={styles.selectionIndicatorContainer}>
                            <View style={[styles.selectionIndicator, isSelected(friend) && styles.selected]} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Text style={styles.subHeader}>Recommendations</Text>
            <View style={styles.recommendationsContainer}>
                <TouchableOpacity onPress={() => setFacultyExpanded(!facultyExpanded)} style={styles.expandableHeader}>
                    <Text style={styles.categoryHeader}>{facultyName}</Text>
                    <Image source={require('../../assets/icons/down-arrow.png')} style={styles.downArrowIcon} />
                </TouchableOpacity>
                {facultyExpanded && (
                    <View>
                        {filteredFacultyRecommendations.map((user: Friend) => (
                            <TouchableOpacity key={user.uid} style={styles.item} onPress={() => handleFriendClick(user)}>
                                <Text style={styles.name}>{user.username}</Text>
                                <View style={styles.selectionIndicatorContainer}>
                                    <View style={[styles.selectionIndicator, isSelected(user) && styles.selected]} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <TouchableOpacity onPress={() => setCampusExpanded(!campusExpanded)} style={styles.expandableHeader}>
                    <Text style={styles.categoryHeader}>{campusName}</Text>
                    <Image source={require('../../assets/icons/down-arrow.png')} style={styles.downArrowIcon} />
                </TouchableOpacity>
                {campusExpanded && (
                    <View>
                        {filteredCampusRecommendations.map((user: Friend) => (
                            <TouchableOpacity key={user.uid} style={styles.item} onPress={() => handleFriendClick(user)}>
                                <Text style={styles.name}>{user.username}</Text>
                                <View style={styles.selectionIndicatorContainer}>
                                    <View style={[styles.selectionIndicator, isSelected(user) && styles.selected]} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
            {selectedFriends.length > 0 && (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={setBookingDetails}
                    >
                        <Text style={styles.actionButtonText}>Book with Selected Friends</Text>
                    </TouchableOpacity>
                </View>
            )}
            <Modal animationType="slide" transparent={true} visible={requestSentModalVisible}>
                <TouchableWithoutFeedback onPress={() => setRequestSentModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Request Sent Successfully!</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
    },
    backButton: {
        position: 'absolute',
        top: 5,
        left: 5,
        zIndex: 1,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    header: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        marginVertical: 10,
        textAlign: 'center',
    },
    searchInput: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    friendsContainer: {
        maxHeight: 200,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        marginBottom: 10,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 18,
        fontFamily: 'Poppins',
        color: '#333',
    },
    selectionIndicatorContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#F87171',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    selected: {
        backgroundColor: '#F87171',
    },
    recommendationsContainer: {
        maxHeight: 300,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        padding: 10,
    },
    expandableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F87171',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
    
    },
    categoryHeader: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
        
    },
    downArrowIcon: {
        width: 16,
        height: 16,
    },
    actionsContainer: {
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    actionButton: {
        padding: 10,
        backgroundColor: '#F87171',
        borderRadius: 10,
        marginVertical: 5,
    },
    actionButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalText: {
        fontSize: 18,
        textAlign: 'center',
    },
});

export default BookingScreen;
