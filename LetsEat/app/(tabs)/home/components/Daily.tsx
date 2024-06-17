import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, off } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

interface Event {
  id: string;
  day: string;
  name: string;
  height: number;
  icon: string;
  type: string;
  time?: string;
}

const Daily = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const eventsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/events`);
      
      const handleValueChange = (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
          const eventsList: Event[] = Object.keys(data).map(key => ({
            ...data[key],
            id: key,
          }));

          // Convert the current date to Singapore timezone
          const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' };
          const currentDate = new Date().toLocaleDateString('en-CA', options);

          const todaysEvents = eventsList.filter(event => event.day === currentDate);

          // Sort Booking events by time
          const sortedEvents = sortEventsByTime(todaysEvents);

          setEvents(sortedEvents);
        } else {
          setEvents([]);
        }
      };

      onValue(eventsRef, handleValueChange);

      return () => {
        off(eventsRef, 'value', handleValueChange);
      };
    };

    fetchEvents();
  }, []);

  const parseTimeString = (timeString: string): Date => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const sortEventsByTime = (events: Event[]): Event[] => {
    return events.sort((a, b) => {
      if (a.type !== 'Booking' || !a.time) return -1;
      if (b.type !== 'Booking' || !b.time) return 1;
      return parseTimeString(a.time).getTime() - parseTimeString(b.time).getTime();
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Open Jio':
        return require('../../../../assets/icons/eat.png'); // Use appropriate icon path
      case 'Booking':
        return require('../../../../assets/icons/reserved.png'); // Use appropriate icon path
      case 'Takeaway':
        return require('../../../../assets/icons/takeaway.png'); // Use appropriate icon path
      default:
        return null;
    }
  };

  const formatEventText = (event: Event) => {
    const username = event.name.replace(/.* with (.*)/, '$1');
    switch (event.type) {
      case 'Open Jio':
        return `with ${username}`;
      case 'Booking':
        return `with ${username} at ${event.time}`;
      case 'Takeaway':
        return event.name; // Keep Takeaway event text unchanged
      default:
        return event.name;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Events</Text>
      <ScrollView style={styles.scrollView}>
        {events.length > 0 ? (
          events.map(event => (
            <View key={event.id} style={styles.eventItem}>
              <Image source={getIcon(event.type)} style={styles.eventIcon} />
              <View>
                <Text style={styles.eventType}>{event.type}</Text>
                <Text style={styles.eventText}>{formatEventText(event)}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noEventsText}>No events for today.</Text>
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
  eventType: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  eventText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  eventTime: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'gray',
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});

export default Daily;
