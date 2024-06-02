import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule } from 'react-native-calendars';
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig'; // Adjust the path to your Firebase config

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
          setItems(data);
        } else {
          setItems({});
        }
      });
    }
  }, [currentUser]);

  const renderItem = (item: AgendaEntry) => {
    return (
      <View style={[styles.item, { height: item.height }]}>
        <Text>{item.name}</Text>
      </View>
    );
  };

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
        <Text>No Events</Text>
      </View>
    );
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Schedule;