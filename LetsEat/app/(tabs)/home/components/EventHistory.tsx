import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, off } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';
import { useRouter } from 'expo-router';

interface Event {
  id: string;
  day: string;
  name: string;
  height: number;
  icon: string;
  type: string;
  time?: string;
  uid: string;
  sender: string;
  confirmedByUser: boolean;
  confirmedByPartner: boolean;
  timestamp: number;
}

const EventHistory = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter(); // Use router for navigation

  useEffect(() => {
    const fetchEventHistory = () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const eventHistoryRef = ref(FIREBASE_DB, `users/${currentUser.uid}/eventHistory`);

      const handleValueChange = (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
          const eventList: Event[] = Object.keys(data).map(key => ({
            ...data[key],
            id: key,
          }));

          // Sort events by timestamp
          const sortedEvents = eventList.sort((a, b) => b.timestamp - a.timestamp);

          setEvents(sortedEvents);
        } else {
          setEvents([]);
        }
      };

      onValue(eventHistoryRef, handleValueChange);

      return () => {
        off(eventHistoryRef, 'value', handleValueChange);
      };
    };

    fetchEventHistory();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Open Jio':
        return require('../../../../assets/icons/eat.png');
      case 'Booking':
        return require('../../../../assets/icons/reserved.png');
      case 'Takeaway':
        return require('../../../../assets/icons/takeaway.png');
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../../../assets/icons/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.header}>Event History</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {events.length > 0 ? (
          events.map(event => (
            <View key={event.id} style={styles.eventItem}>
              <Image source={getIcon(event.type)} style={styles.eventIcon} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventType}>{event.type}</Text>
                <Text style={styles.eventText}>{event.name}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.timestamp).toLocaleDateString('en-GB')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noEventsText}>No past events found.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  scrollView: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    padding: 10,
  },
  eventItem: {
    backgroundColor: '#ffe4e1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventType: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  eventText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  eventDate: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'grey',
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});

export default EventHistory;
