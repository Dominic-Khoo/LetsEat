import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDatabase, ref, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const BookingDetails = () => {
    const { friend } = useLocalSearchParams();
    const friendData = JSON.parse(friend as string);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const router = useRouter();
    const database = getDatabase();

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setTime(undefined); // Reset time when date changes
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(Platform.OS === 'ios');
        setTime(currentTime);
    };

    const sendBookingRequest = () => {
        if (date && time) {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) {
                alert('User not authenticated.');
                return;
            }

            const bookingDetails = {
                date: date.toISOString(),
                time: time.toISOString(),
                requesterEmail: currentUser.email,
                requesterUid: currentUser.uid,
                requesterUsername: currentUser.displayName, 
            };

            const bookingRef = ref(database, `users/${friendData.uid}/bookingRequests`);
            push(bookingRef, bookingDetails)
                .then(() => {
                    alert(`Booking request sent to ${friendData.username} for ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`);
                    router.back(); 
                })
                .catch((error) => {
                    console.error("Error sending booking request: ", error);
                    alert('Error sending booking request. Please try again.');
                });
        } else {
            alert('Please select both date and time.');
        }
    };

    const currentDateTime = new Date();

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Booking with {friendData.username}</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.picker}>
                <Text style={styles.pickerText}>
                    {date ? date.toLocaleDateString() : 'Select Date'}
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
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.picker}>
                <Text style={styles.pickerText}>
                    {time ? time.toLocaleTimeString() : 'Select Time'}
                </Text>
            </TouchableOpacity>
            {showTimePicker && (
                <DateTimePicker
                    value={time || currentDateTime}
                    mode="time"
                    display="default"
                    minimumDate={date && date.toDateString() === currentDateTime.toDateString() ? currentDateTime : undefined}
                    onChange={onTimeChange}
                />
            )}
            <TouchableOpacity onPress={sendBookingRequest} style={styles.button}>
                <Text style={styles.buttonText}>Send Booking Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 20,
    },
    picker: {
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 18,
        fontFamily: 'Poppins',
    },
    button: {
        backgroundColor: '#f87171',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins',
    },
    backButton: {
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 10,
        marginVertical: 5,
        width: '80%'
    },
    backButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default BookingDetails;
