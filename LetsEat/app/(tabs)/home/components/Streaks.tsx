import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, get, set } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

interface Streak {
  friendUsername: string;
  count: number;
  lastInteraction: string;
  friendUid: string;
}

const Streaks = () => {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [selectedStreak, setSelectedStreak] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number } | null>(null);

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
              friendUid: key,
            };
          }));

          // Sort the streaks by count in descending order
          streaksList.sort((a, b) => b.count - a.count);

          setStreaks(streaksList);
        } else {
          setStreaks([]);
        }
      });
    };

    fetchStreaks();
  }, []);

  const handleStreakPress = (friendUid: string, lastInteraction: string, count: number) => {
    if (selectedStreak === friendUid) {
      setSelectedStreak(null);
      setTimeLeft(null);
    } else if (count > 0) {
      setSelectedStreak(friendUid);
      const lastInteractionDate = new Date(lastInteraction);
      const currentDate = new Date();
      const timeDifference = 7 * 24 * 3600 * 1000 - (currentDate.getTime() - lastInteractionDate.getTime());
      const daysLeft = Math.floor(timeDifference / (1000 * 3600 * 24));
      const hoursLeft = Math.floor((timeDifference % (1000 * 3600 * 24)) / (1000 * 3600));
      setTimeLeft({ days: daysLeft, hours: hoursLeft });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Streaks</Text>
      <ScrollView style={styles.scrollView}>
        {streaks.length > 0 ? (
          streaks.map((streak, index) => (
            <TouchableOpacity key={index} style={styles.streakItem} onPress={() => handleStreakPress(streak.friendUid, streak.lastInteraction, streak.count)}>
              <Text style={styles.friendUsername}>{streak.friendUsername}</Text>
              <Text style={styles.streakCount}>{streak.count}</Text>
              {selectedStreak === streak.friendUid && timeLeft && streak.count > 0 && (
                <Text style={styles.timeLeftText}>{`${timeLeft.days} days, ${timeLeft.hours} hours left`}</Text>
              )}
            </TouchableOpacity>
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
    padding: 20,
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
    alignItems: 'center',
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
  timeLeftText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'gray',
    marginTop: 5,
  },
});

export default Streaks;
