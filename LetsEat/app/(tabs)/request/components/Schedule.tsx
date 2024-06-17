import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule } from 'react-native-calendars';
import { getAuth } from 'firebase/auth';
import { ref, remove, get, set } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';

interface CustomAgendaEntry extends AgendaEntry {
  id: string;
  icon: string;
  time?: string;
}

interface ScheduleProps {
  refreshTrigger: number;
}

const Schedule: React.FC<ScheduleProps> = ({ refreshTrigger }) => {
  const [items, setItems] = useState<AgendaSchedule>({});
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const fetchEventsAndUpdateAgenda = async () => {
    if (currentUser) {
      try {
        const eventsRef = ref(FIREBASE_DB, `users/${currentUser.uid}/events`);
        const snapshot = await get(eventsRef);
        const data = snapshot.val();
        const events = data ? Object.keys(data).map(key => ({ ...data[key], id: key })) as CustomAgendaEntry[] : [];

        const newAgenda: AgendaSchedule = {};

        events.forEach(event => {
          if (!newAgenda[event.day]) {
            newAgenda[event.day] = [];
          }
          newAgenda[event.day].push(event);
        });

        const sortedData = sortEvents(newAgenda);
        setItems(sortedData);
        console.log('Sorted data:', sortedData);
      } catch (error) {
        console.error("Error fetching events and updating agenda:", error);
      }
    }
  };

  useEffect(() => {
    fetchEventsAndUpdateAgenda();
  }, [currentUser, refreshTrigger]);

  const handleRemoveEvent = async (id: string) => {
    if (currentUser) {
      const eventRef = ref(FIREBASE_DB, `users/${currentUser.uid}/events/${id}`);
      await remove(eventRef);
      setItems(prevItems => {
        const newItems = { ...prevItems };
        Object.keys(newItems).forEach(day => {
          newItems[day] = (newItems[day] as CustomAgendaEntry[]).filter(event => event.id !== id);
        });
        return newItems;
      });
    }
  };

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
              { text: 'OK', onPress: () => handleRemoveEvent(customItem.id) },
            ])
          }
        >
          <Image source={require('../../../../assets/icons/close.png')} style={styles.removeIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyDate = () => {
    return <View style={styles.emptyDate}></View>;
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
      sortedData[date] = sortEventsByTime(data[date] as CustomAgendaEntry[]);
    });

    return sortedData;
  };

  const sortEventsByTime = (events: CustomAgendaEntry[]): CustomAgendaEntry[] => {
    return events.sort((a, b) => {
      if (!a.time) return -1;
      if (!b.time) return 1;
      return parseTimeString(a.time).getTime() - parseTimeString(b.time).getTime();
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
    flexDirection: 'column',
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
