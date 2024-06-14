import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule } from 'react-native-calendars';
import { getAuth } from 'firebase/auth';
import { ref, onValue, remove, get, update } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig'; // Adjust the path to your Firebase config

// Extend the AgendaEntry type to include the icon property
interface CustomAgendaEntry extends AgendaEntry {
  icon: string;
  time?: string; // Optional time property for events with time
}

const Schedule = () => {
  const [items, setItems] = useState<AgendaSchedule>({});
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      const userAgendaRef = ref(FIREBASE_DB, `users/${currentUser.uid}/agenda`);
      onValue(userAgendaRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const sortedData = sortEvents(data);
          setItems(sortedData);
          console.log('Sorted data:', sortedData); // Log sorted data
        } else {
          setItems({});
        }
      });
    }
  }, [currentUser]);

  const handleRemoveEvent = async (date: string, eventName: string, eventTime?: string) => {
    if (currentUser) {
      const userAgendaRef = ref(FIREBASE_DB, `users/${currentUser.uid}/agenda/${date}`);
      const snapshot = await get(userAgendaRef);
      const events: CustomAgendaEntry[] = (snapshot.val() || []).filter((event: any) => event.icon);

      const updatedEvents = events.filter(event => !(event.name === eventName && event.time === eventTime));
      console.log('Updated events after removal:', updatedEvents); // Log updated events

      if (updatedEvents.length === 0) {
        await remove(userAgendaRef);
      } else {
        await update(ref(FIREBASE_DB, `users/${currentUser.uid}/agenda`), { [date]: updatedEvents });
      }
      setItems(prevItems => {
        const updatedItems = { ...prevItems };
        updatedItems[date] = sortEventsByTime(updatedEvents);
        console.log('Updated items:', updatedItems); // Log updated items
        return updatedItems;
      });
    }
  };

  const getIconSource = (iconName: string) => {
    switch (iconName) {
      case 'eat':
        return require('../../../../assets/icons/eat.png');
      case 'reserved':
        return require('../../../../assets/icons/reserved.png');
      case 'takeaway':
        return require('../../../../assets/icons/takeaway.png');
      default:
        return null;
    }
  };

  const renderItem = (item: AgendaEntry, firstItemInDay: boolean) => {
    const customItem = item as CustomAgendaEntry;

    return (
      <View style={[styles.item, { height: customItem.height }]}>
        <Image source={getIconSource(customItem.icon)} style={styles.icon} />
        <View style={styles.textContainer}>
          {customItem.time && <Text style={styles.timeText}>{customItem.time}</Text>}
          <Text style={styles.requestText}>{customItem.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeIconContainer}
          onPress={() =>
            Alert.alert('Remove Event', 'Are you sure you want to remove this event?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK', onPress: () => handleRemoveEvent(customItem.day, customItem.name, customItem.time) },
            ])
          }
        >
          <Image source={require('../../../../assets/icons/close.png')} style={styles.removeIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}></View>
    );
  };

  const theme = {
    selectedDayBackgroundColor: 'lightcoral',
    dotColor: 'lightcoral',
    agendaTodayColor: 'lightcoral',
    todayTextColor: 'lightcoral',
  };

  const sortEvents = (data: AgendaSchedule): AgendaSchedule => {
    const sortedData: AgendaSchedule = {};

    Object.keys(data).forEach(date => {
      sortedData[date] = sortEventsByTime((data[date] as CustomAgendaEntry[]).filter(event => event.icon));
    });

    return sortedData;
  };

  const sortEventsByTime = (events: CustomAgendaEntry[]): CustomAgendaEntry[] => {
    return events.sort((a, b) => {
      if (!a.time) return -1;
      if (!b.time) return 1;
      return new Date(`1970-01-01T${a.time}`).getTime() - new Date(`1970-01-01T${b.time}`).getTime();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Agenda
        items={items}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        pastScrollRange={12}
        futureScrollRange={12}
        renderEmptyData={() => <View />}
        theme={theme}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column', // Stack the time and booking text vertically
  },
  timeText: {
    fontSize: 16,
    color: '#000',
  },
  requestText: {
    fontSize: 16,
    color: '#000',
  },
  removeIconContainer: {
    padding: 5,
  },
  removeIcon: {
    width: 20,
    height: 20,
  },
});

export default Schedule;
