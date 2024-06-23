import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, get, set } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

interface Streak {
  friendUsername: string;
  count: number;
  lastInteraction: string;
}

const Streaks = () => {
  const [streaks, setStreaks] = useState<Streak[]>([]);

  useEffect(() => {
    const fetchStreaks = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const streaksRef = ref(FIREBASE_DB, `users/${currentUser.uid}/streaks`);
      onValue(streaksRef, async (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const currentDate = new Date();
          const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' };
          const formattedCurrentDate = currentDate.toLocaleDateString('en-CA', options);

          const streaksList: Streak[] = await Promise.all(Object.keys(data).map(async (key) => {
            const friendRef = ref(FIREBASE_DB, `users/${key}`);
            const friendSnapshot = await get(friendRef);
            const friendData = friendSnapshot.val();

            const lastInteractionDate = new Date(data[key].lastInteraction);
            const timeDifference = currentDate.getTime() - lastInteractionDate.getTime();
            const daysDifference = timeDifference / (1000 * 3600 * 24);

            if (daysDifference >= 7) {
              // Reset streak if no interaction for a week
              data[key].count = 0;
              data[key].lastInteraction = formattedCurrentDate;
              await set(ref(FIREBASE_DB, `users/${currentUser.uid}/streaks/${key}`), data[key]);
            }

            return {
              friendUsername: friendData.username,
              count: data[key].count,
              lastInteraction: data[key].lastInteraction,
            };
          }));

          setStreaks(streaksList);
        } else {
          setStreaks([]);
        }
      });
    };

    fetchStreaks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Streaks</Text>
      <ScrollView style={styles.scrollView}>
        {streaks.length > 0 ? (
          streaks.map((streak, index) => (
            <View key={index} style={styles.streakItem}>
              <Text style={styles.friendUsername}>{streak.friendUsername}</Text>
              <Text style={styles.streakCount}>{streak.count}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noStreaksText}>No streaks available.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  scrollView: {
    maxHeight: 200,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    padding: 5,
  },
  streakItem: {
    backgroundColor: '#ffe4e1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  friendUsername: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  streakCount: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  noStreaksText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});

export default Streaks;
