import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

type Achievement = {
    id: string;
    name: string;
    criteria: string;
    threshold: number;
    image: any;
    description: string;
};

type UserData = {
    takeawayCount: number;
    mealsCount: number;
    friendsCount: number;
    plannerCount: number;
    [key: string]: number; 
};

const achievementsData: Achievement[] = [
  { id: 'dabaoKing', name: 'Dabao King', criteria: 'takeawayCount', threshold: 10, image: require('../../../../assets/icons/package.png'), description: 'Takeaway 10 times' },
  { id: 'frequentDiner', name: 'Frequent Diner', criteria: 'mealsCount', threshold: 3, image: require('../../../../assets/icons/dinner.png'), description: 'Have 3 meals' },
  { id: 'gettingStarted', name: 'Getting Started', criteria: 'friendsCount', threshold: 3, image: require('../../../../assets/icons/friends.png'), description: 'Make 3 friends' },
  { id: 'eatingKakis', name: 'Eating-Kakis', criteria: 'friendsCount', threshold: 50, image: require('../../../../assets/icons/friendship.png'), description: 'Make 50 friends' },
  { id: 'papaPaparazzi', name: 'Papa-paparazzi', criteria: 'friendsCount', threshold: 100, image: require('../../../../assets/icons/accommodation.png'), description: 'Make 100 friends' },
  { id: 'eventPlanner', name: 'Event Planner', criteria: 'plannerCount', threshold: 5, image: require('../../../../assets/icons/planner.png'), description: 'Plan 5 events' },
];

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(achievementsData);
  const [userData, setUserData] = useState<UserData>({
    takeawayCount: 0,
    mealsCount: 0,
    friendsCount: 0,
    plannerCount: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userRef = ref(FIREBASE_DB, `users/${currentUser.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData({
            takeawayCount: data.takeawayCount || 0,
            mealsCount: data.mealsCount || 0,
            friendsCount: data.friendsCount || 0,
            plannerCount: data.plannerCount || 0,
          });
        }
      });
    };

    fetchUserData();
  }, []);

  const getProgress = (criteria: string, threshold: number) => {
    return userData[criteria] >= threshold
      ? `${threshold}/${threshold}`
      : `${userData[criteria]}/${threshold}`;
  };

  const getAchievementStyle = (criteria: string, threshold: number) => {
    return userData[criteria] >= threshold ? styles.achieved : styles.notAchieved;
  };

  const sortedAchievements = achievements.sort((a, b) => {
    const aAchieved = userData[a.criteria] >= a.threshold;
    const bAchieved = userData[b.criteria] >= b.threshold;
    if (aAchieved && !bAchieved) return -1;
    if (!aAchieved && bAchieved) return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Achievements</Text>
      <ScrollView style={styles.scrollView}>
        {sortedAchievements.map((achievement, index) => (
          <View key={index} style={[styles.achievementItem, getAchievementStyle(achievement.criteria, achievement.threshold)]}>
            <Image source={achievement.image} style={styles.achievementIcon} />
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementText}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
            <Text style={styles.achievementProgress}>
              {getProgress(achievement.criteria, achievement.threshold)}
            </Text>
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
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  achieved: {
    backgroundColor: '#d4edda',
  },
  notAchieved: {
    backgroundColor: '#f8d7da',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'gray',
  },
  achievementProgress: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
    marginLeft: 'auto',
  },
});

export default Achievements;
