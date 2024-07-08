import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, push, set, get } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';
import { router } from 'expo-router';

type User = {
    uid: string;
    email: string;
    username: string;
    faculty: string;
    campusAccomodation: string;
    profilePicture?: string;
};

const OpenJioScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<User[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<User[]>([]);
    const [facultyRecommendations, setFacultyRecommendations] = useState<User[]>([]);
    const [campusRecommendations, setCampusRecommendations] = useState<User[]>([]);
    const [filteredFacultyRecommendations, setFilteredFacultyRecommendations] = useState<User[]>([]);
    const [filteredCampusRecommendations, setFilteredCampusRecommendations] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [requestSentModalVisible, setRequestSentModalVisible] = useState(false);
    const [facultyExpanded, setFacultyExpanded] = useState(false);
    const [campusExpanded, setCampusExpanded] = useState(false);
    const [facultyName, setFacultyName] = useState('');
    const [campusName, setCampusName] = useState('');

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const friendsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/friendsList`);
        onValue(friendsRef, async (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const friendsList = await Promise.all(Object.keys(data).map(async key => {
                    const userRef = ref(FIREBASE_DB, `users/${key}`);
                    const userSnapshot = await get(userRef);
                    const userData = userSnapshot.val();
                    return {
                        uid: key,
                        email: data[key].email,
                        username: data[key].username,
                        faculty: userData?.faculty || '',
                        campusAccomodation: userData?.campusAccomodation || '',
                        profilePicture: userData?.profilePicture || null,
                    };
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
                onValue(allUsersRef, async (allSnapshot) => {
                    const allUsersData = allSnapshot.val();
                    if (allUsersData) {
                        const allUsers = await Promise.all(Object.keys(allUsersData).map(async key => {
                            const userRef = ref(FIREBASE_DB, `users/${key}`);
                            const userSnapshot = await get(userRef);
                            const userData = userSnapshot.val();
                            return {
                                uid: key,
                                email: allUsersData[key].email,
                                username: allUsersData[key].username,
                                faculty: allUsersData[key].faculty,
                                campusAccomodation: allUsersData[key].campusAccomodation,
                                profilePicture: userData?.profilePicture || null,
                            };
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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query) {
            setFilteredFriends(friends); // Reset to all friends if search query is empty
            setFilteredFacultyRecommendations(facultyRecommendations); // Reset to all faculty recommendations if search query is empty
            setFilteredCampusRecommendations(campusRecommendations); // Reset to all campus recommendations if search query is empty
            return;
        }
        const filteredFriends = friends.filter((friend: User) =>
            friend.username.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredFriends(filteredFriends);

        const filteredFaculty = facultyRecommendations.filter((user: User) =>
            user.username.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredFacultyRecommendations(filteredFaculty);

        const filteredCampus = campusRecommendations.filter((user: User) =>
            user.username.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCampusRecommendations(filteredCampus);
    };

    const handleUserClick = (user: User) => {
        if (selectedUsers.some(selectedUser => selectedUser.uid === user.uid)) {
            setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser.uid !== user.uid));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const sendOpenJioRequests = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const requests = selectedUsers.map(user => {
                const requestRef = ref(FIREBASE_DB, `users/${user.uid}/openJioRequests`);
                const newRequestRef = push(requestRef);
                return set(newRequestRef, {
                    requesterUid: currentUser.uid,
                    requesterEmail: currentUser.email,
                    requesterUsername: currentUser.displayName,
                    timestamp: Date.now(),
                });
            });

            await Promise.all(requests);
            console.log('Open Jio Requests sent successfully');
            setRequestSentModalVisible(true); // Show the success modal
            setSelectedUsers([]); // Clear selected users after sending requests
        } catch (error) {
            console.error('Error sending Open Jio Requests:', (error as Error).message);
        }
    };

    const isSelected = (user: User) => selectedUsers.some(selectedUser => selectedUser.uid === user.uid);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Image source={require('../../assets/icons/back.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.header}>Who to Jio?</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                onChangeText={handleSearch}
                value={searchQuery}
            />
            <Text style={styles.subHeader}>Friends List</Text>
            <View style={styles.usersContainer}>
                <ScrollView>
                    {filteredFriends.length === 0 ? (
                        <Text style={styles.noFriendsText}>You currently have no friends on LetsEat!</Text>
                    ) : (
                        filteredFriends.map((friend: User) => (
                            <TouchableOpacity key={friend.uid} style={styles.item} onPress={() => handleUserClick(friend)}>
                                <Image source={friend.profilePicture ? { uri: friend.profilePicture } : require('../../assets/images/defaultprofile.png')} style={styles.profilePicture} />
                                <Text style={styles.name}>{friend.username}</Text>
                                <View style={styles.selectionIndicatorContainer}>
                                    <View style={[styles.selectionIndicator, isSelected(friend) && styles.selected]} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>
            <Text style={styles.subHeader}>Recommendations</Text>
            <View style={styles.recommendationsContainer}>
                <ScrollView>
                    <TouchableOpacity onPress={() => setFacultyExpanded(!facultyExpanded)} style={styles.expandableHeader}>
                        <Text style={styles.categoryHeader}>{facultyName}</Text>
                        <Image source={require('../../assets/icons/down-arrow.png')} style={styles.downArrowIcon} />
                    </TouchableOpacity>
                    {facultyExpanded && (
                        <View>
                            {filteredFacultyRecommendations.map((user: User) => (
                                <TouchableOpacity key={user.uid} style={styles.recommendationItem} onPress={() => handleUserClick(user)}>
                                    <Image source={user.profilePicture ? { uri: user.profilePicture } : require('../../assets/images/defaultprofile.png')} style={styles.profilePicture} />
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
                            {filteredCampusRecommendations.map((user: User) => (
                                <TouchableOpacity key={user.uid} style={styles.recommendationItem} onPress={() => handleUserClick(user)}>
                                    <Image source={user.profilePicture ? { uri: user.profilePicture } : require('../../assets/images/defaultprofile.png')} style={styles.profilePicture} />
                                    <Text style={styles.name}>{user.username}</Text>
                                    <View style={styles.selectionIndicatorContainer}>
                                        <View style={[styles.selectionIndicator, isSelected(user) && styles.selected]} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
            {selectedUsers.length > 0 && (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={sendOpenJioRequests}
                    >
                        <Text style={styles.actionButtonText}>Jio Selected Users!</Text>
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
    scrollView: {
        flex: 1,
    },
    usersContainer: {
        maxHeight: 200,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        marginBottom: 10,
    },
    noFriendsText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        padding: 20,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
    },
    recommendationItem: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 18,
        fontFamily: 'Poppins',
        color: '#333',
        flex: 1,
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 10,
    },
    categoryHeader: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
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
    downArrowIcon: {
        width: 16,
        height: 16,
    },
    recommendationsContainer: {
        maxHeight: 300,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        padding: 10,
    },
    selectionIndicatorContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'transparent',
    },
    selected: {
        backgroundColor: '#F87171',
    },
    actionsContainer: {
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    selectedUserText: {
        fontSize: 16,
        marginBottom: 10,
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
        fontFamily: 'Poppins',
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

export default OpenJioScreen;
