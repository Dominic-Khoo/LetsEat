import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getDatabase, ref, push, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { IntervalTree, Interval } from "./FindCommonSlots";
import { icons } from "@/constants";

const BookingDetails = () => {
  const { friends } = useLocalSearchParams();
  const selectedFriends = JSON.parse(friends as string);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [suggestedTimes, setSuggestedTimes] = useState<Interval[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();
  const database = getDatabase();

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
    setTime(undefined); // Reset time when date changes
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === "ios");
    setTime(currentTime);
  };

  const fetchEvents = async (userUid: string, friendsUids: string[]) => {
    const events: { [key: string]: any } = {};

    // Fetch user's events
    const userEventsRef = ref(database, `users/${userUid}/events`);
    const userEventsSnapshot = await get(userEventsRef);
    if (userEventsSnapshot.exists()) {
      events[userUid] = userEventsSnapshot.val();
    } else {
      console.log(`No events found for user ${userUid}`);
    }

    // Fetch friends' events
    for (const friendUid of friendsUids) {
      const friendEventsRef = ref(database, `users/${friendUid}/events`);
      const friendEventsSnapshot = await get(friendEventsRef);
      if (friendEventsSnapshot.exists()) {
        events[friendUid] = friendEventsSnapshot.val();
      } else {
        console.log(`No events found for friend ${friendUid}`);
      }
    }

    console.log("Fetched events:", events);
    return filterBookingEvents(events);
  };

  // Function to filter out events of type "Booking"
  const filterBookingEvents = (events: { [key: string]: any }) => {
    const bookingEvents: { [key: string]: any } = {};

    Object.keys(events).forEach((userUid) => {
      bookingEvents[userUid] = {};
      Object.keys(events[userUid]).forEach((eventKey) => {
        const event = events[userUid][eventKey];
        if (event.type === "Booking") {
          bookingEvents[userUid][eventKey] = event;
        }
      });
    });

    console.log("Filtered booking events:", bookingEvents);
    return bookingEvents;
  };

  const parseEventDate = (dateString: string, timeString: string) => {
    // Assuming date is in 'YYYY-MM-DD' format and time is in 'HH:mm AM/PM' format
    const [year, month, day] = dateString.split("-");
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      hours,
      minutes
    );
  };

  const findCommonFreeSlots = (
    events: { [key: string]: any },
    selectedDate: Date
  ) => {
    const intervalTree = new IntervalTree();

    Object.values(events).forEach((userEvents: any) => {
      Object.values(userEvents).forEach((event: any) => {
        const eventDate = new Date(event.day);
        console.log(
          `Event date: ${eventDate.toDateString()}, Selected date: ${selectedDate.toDateString()}`
        );
        if (eventDate.toDateString() === selectedDate.toDateString()) {
          const startTime = parseEventDate(event.day, event.time).getTime();
          const endTime = startTime + 60 * 60 * 1000; // One hour from start time

          intervalTree.insert(new Interval(startTime, endTime));
        }
      });
    });

    const startOfDay = new Date(selectedDate).setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate).setHours(23, 59, 59, 999);
    const fullDayInterval = new Interval(startOfDay, endOfDay);

    const busySlots = intervalTree.search(fullDayInterval);

    // Sort busy slots by start time
    busySlots.sort((a, b) => a.start - b.start);
    console.log(`Busy slots:`);
    busySlots.forEach((slot) => {
      console.log(
        `  ${new Date(slot.start).toLocaleTimeString()} - ${new Date(
          slot.end
        ).toLocaleTimeString()}`
      );
    });

    const freeSlots: Interval[] = [];
    let lastEnd = fullDayInterval.start;

    busySlots.forEach((slot) => {
      if (lastEnd < slot.start) {
        freeSlots.push(new Interval(lastEnd, slot.start));
      }
      lastEnd = Math.max(lastEnd, slot.end);
    });

    if (lastEnd < fullDayInterval.end) {
      freeSlots.push(new Interval(lastEnd, fullDayInterval.end));
    }

    return freeSlots;
  };

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }

    const fetchAndSetSuggestedTimes = async () => {
      const events = await fetchEvents(
        currentUser.uid,
        selectedFriends.map((friend: any) => friend.uid)
      );
      if (date) {
        const freeSlots = findCommonFreeSlots(events, date);
        freeSlots.forEach((slot) => {
          const startTime = new Date(slot.start);
          const endTime = new Date(slot.end);

          console.log(
            `Free Slot: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`
          );
        });
        setSuggestedTimes(freeSlots);
      }
    };

    fetchAndSetSuggestedTimes();
  }, [date]);

  const sendBookingRequests = async () => {
    if (date && time) {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("User not authenticated.");
        return;
      }

      const bookingDetails = {
        date: date.toISOString(),
        time: time.toISOString(),
        requesterEmail: currentUser.email,
        requesterUid: currentUser.uid,
        requesterUsername: currentUser.displayName,
      };

      try {
        const requests = selectedFriends.map(
          (friend: { uid: string; username: string }) => {
            const bookingRef = ref(
              database,
              `users/${friend.uid}/bookingRequests`
            );
            return push(bookingRef, bookingDetails);
          }
        );

        await Promise.all(requests);
        alert(
          `Booking requests sent to ${selectedFriends
            .map((friend: { username: string }) => friend.username)
            .join(
              ", "
            )} for ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`
        );
        router.back();
      } catch (error) {
        console.error("Error sending booking requests: ", error);
        alert("Error sending booking requests. Please try again.");
      }
    } else {
      alert("Please select both date and time.");
    }
  };

  const currentDateTime = new Date();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Image source={icons.back} style={styles.backIcon} />
      </TouchableOpacity>
      <View style={styles.innerContainer}>
        <Text style={styles.header}>
          Booking with{" "}
          {selectedFriends
            .map((friend: { username: string }) => friend.username)
            .join(", ")}
        </Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.picker}
        >
          <Text style={styles.pickerText}>
            {date ? date.toLocaleDateString() : "Select Date"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date || currentDateTime}
            mode="date"
            display="default"
            minimumDate={currentDateTime}
            onChange={onDateChange}
          />
        )}
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={styles.picker}
        >
          <Text style={styles.pickerText}>
            {time ? time.toLocaleTimeString() : "Select Time"}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time || currentDateTime}
            mode="time"
            display="default"
            minimumDate={
              date && date.toDateString() === currentDateTime.toDateString()
                ? currentDateTime
                : undefined
            }
            onChange={onTimeChange}
          />
        )}
        <TouchableOpacity onPress={sendBookingRequests} style={styles.button}>
          <Text style={styles.buttonText}>Send Booking Requests</Text>
        </TouchableOpacity>

        {suggestedTimes.length > 0 && (
          <View style={styles.suggestedTimes}>
            <Text style={styles.suggestedHeader}>Suggested Times:</Text>
            {suggestedTimes.map((slot, index) => (
              <Text key={index} style={styles.suggestedTime}>
                {new Date(slot.start).toLocaleTimeString()} -{" "}
                {new Date(slot.end).toLocaleTimeString()}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 20,
    textAlign: "center",
  },
  picker: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  pickerText: {
    fontSize: 18,
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#f87171",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
  },

  backIcon: {
    width: 25,
    height: 25,
  },
  suggestedTimes: {
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  suggestedHeader: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  suggestedTime: {
    fontSize: 16,
    fontFamily: "Poppins",
    marginTop: 5,
  },
});

export default BookingDetails;
