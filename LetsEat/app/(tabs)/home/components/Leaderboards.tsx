import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';
import { useRouter } from 'expo-router';

type User = {
  uid: string;
  username: string;
  mealsCount: number;
  profilePicture?: string;
};

const Leaderboards = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsersData = async () => {
      const usersRef = ref(FIREBASE_DB, 'users');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const usersList = Object.keys(data).map(key => ({
            uid: key,
            username: data[key].username,
            mealsCount: data[key].mealsCount || 0,
            profilePicture: data[key].profilePicture || null,
          }));
          setUsers(usersList.sort((a, b) => b.mealsCount - a.mealsCount));
        }
        setLoading(false);
      });
    };

    fetchUsersData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#ff6f69" />;
  }

  const getHighlightStyle = (index: number) => {
    switch (index) {
      case 0:
        return styles.firstPlace;
      case 1:
        return styles.secondPlace;
      case 2:
        return styles.thirdPlace;
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboards</Text>
      <ScrollView style={styles.scrollView}>
        {users.map((user, index) => (
          <View key={user.uid} style={[styles.userItem, getHighlightStyle(index)]}>
            <Image
              style={styles.profilePicture}
              source={user.profilePicture ? { uri: user.profilePicture } : require('../../../../assets/images/defaultprofile.png')}
            />
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.mealsCount}>{user.mealsCount} Meals</Text>
            {index === 0 && <Image source={require('../../../../assets/icons/medal.png')} style={styles.medal} />}
            {index === 1 && <Image source={require('../../../../assets/icons/silver.png')} style={styles.medal} />}
            {index === 2 && <Image source={require('../../../../assets/icons/bronze.png')} style={styles.medal} />}
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
  header: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  scrollView: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    padding: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  mealsCount: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'black',
  },
  medal: {
    width: 24,
    height: 24,
  },
  firstPlace: {
    backgroundColor: '#ffd700',
  },
  secondPlace: {
    backgroundColor: '#c0c0c0',
  },
  thirdPlace: {
    backgroundColor: '#cd7f32',
  },
});

export default Leaderboards;
