import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue, off, set, update, get, remove } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

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
  confirmedByUser?: boolean;
  confirmedByPartner?: boolean;
  sharedEventId?: string;
}

const Daily = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showConfirmButtons, setShowConfirmButtons] = useState<{ [key: string]: boolean }>({});

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

  const handleConfirm = async (event: Event) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const eventRef = ref(FIREBASE_DB, `users/${currentUser.uid}/events/${event.id}`);
    await update(eventRef, { confirmedByUser: true });

    const partnerUid = event.uid; // Assuming the name format is "Event with User"
    const partnerEventRef = ref(FIREBASE_DB, `users/${partnerUid}/events`);
    const partnerEventSnapshot = await get(partnerEventRef);
    const partnerEvents = partnerEventSnapshot.val();
    const partnerEventKey = Object.keys(partnerEvents).find(key => partnerEvents[key].sharedEventId === event.sharedEventId);
    const partnerEvent = partnerEventKey ? partnerEvents[partnerEventKey] : null;

    if (partnerEvent && partnerEvent.confirmedByUser) {
      // Both users have confirmed
      await updateStreaks(currentUser.uid, partnerUid);
      await updateStreaks(partnerUid, currentUser.uid);
      
      // Increment counts for both users
      if (event.type === 'Open Jio' || event.type === 'Booking') {
        await incrementMealsCount(currentUser.uid);
        await incrementMealsCount(partnerUid);
        await incrementPlannerCount(event.sender);
      } else if (event.type === 'Takeaway') {
        await incrementTakeawayCount(currentUser.uid);
        await incrementTakeawayCount(partnerUid);
      }

      // Remove the event
      await remove(eventRef);
      await remove(ref(FIREBASE_DB, `users/${partnerUid}/events/${partnerEventKey}`));
    } else if (partnerEventKey) {
      await update(ref(FIREBASE_DB, `users/${partnerUid}/events/${partnerEventKey}`), { confirmedByPartner: true });
      await update(eventRef, { confirmedByUser: true });
    }
  };

  const updateStreaks = async (currentUserUid: string, partnerUid: string) => {
    const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' };
    const currentDate = new Date().toLocaleDateString('en-CA', options);
    
    const streaksRef = ref(FIREBASE_DB, `users/${currentUserUid}/streaks/${partnerUid}`);
    const streakSnapshot = await get(streaksRef);
    const streakData = streakSnapshot.val();

    if (streakData) {
      const lastInteractionDate = new Date(streakData.lastInteraction);
      const currentInteractionDate = new Date(currentDate);
      const lastInteractionDay = lastInteractionDate.toLocaleDateString('en-CA', options);
      const currentDay = currentInteractionDate.toLocaleDateString('en-CA', options);

      if (lastInteractionDay === currentDay) {
        // Interaction happened on the same day, don't increment the streak
        return;
      } else {
        // Increment the streak
        streakData.count += 1;
        streakData.lastInteraction = currentDate;
        await set(streaksRef, streakData);
      }
    } else {
      await set(streaksRef, {
        count: 1,
        lastInteraction: currentDate,
      });
    }
  };

  const incrementMealsCount = async (userUid: string) => {
    const userRef = ref(FIREBASE_DB, `users/${userUid}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    if (userData) {
      const updatedMealsCount = (userData.mealsCount || 0) + 1;
      await update(userRef, { mealsCount: updatedMealsCount });
    }
  };

  const incrementPlannerCount = async (userUid: string) => {
    const userRef = ref(FIREBASE_DB, `users/${userUid}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    if (userData) {
      const updatedPlannerCount = (userData.plannerCount || 0) + 1;
      await update(userRef, { plannerCount: updatedPlannerCount });
    }
  };

  const incrementTakeawayCount = async (userUid: string) => {
    const userRef = ref(FIREBASE_DB, `users/${userUid}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    if (userData) {
      const updatedTakeawayCount = (userData.takeawayCount || 0) + 1;
      await update(userRef, { takeawayCount: updatedTakeawayCount });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Events</Text>
      <ScrollView style={styles.scrollView}>
        {events.length > 0 ? (
          events.map(event => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventItem}
              onPress={() => {
                if (!event.confirmedByUser) {
                  setShowConfirmButtons(prev => ({ ...prev, [event.id]: !prev[event.id] }));
                }
              }}
            >
              <Image source={getIcon(event.type)} style={styles.eventIcon} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventType}>{event.type}</Text>
                <Text style={styles.eventText}>{formatEventText(event)}</Text>
                {event.confirmedByUser && !event.confirmedByPartner && (
                  <Text style={styles.awaitingConfirmationText}>Awaiting Confirmation</Text>
                )}
              </View>
              {showConfirmButtons[event.id] && !event.confirmedByUser && (
                <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(event)}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
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
  confirmButton: {
    padding: 5,
    backgroundColor: 'brown',
    borderRadius: 5,
  },
  confirmText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'white',
  },
  awaitingConfirmationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'orange',
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});

export default Daily;
