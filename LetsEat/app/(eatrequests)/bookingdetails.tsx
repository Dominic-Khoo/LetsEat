// screens/bookingdetails/index.tsx
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
            };

            const bookingRef = ref(database, `users/${friendData.uid}/bookingRequests`);
            push(bookingRef, bookingDetails)
                .then(() => {
                    alert(`Booking request sent to ${friendData.email} for ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`);
                    router.back(); // Navigate back to the previous screen
                })
                .catch((error) => {
                    console.error("Error sending booking request: ", error);
                    alert('Error sending booking request. Please try again.');
                });
        } else {
            alert('Please select both date and time.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Booking Request to {friendData.email}</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.picker}>
                <Text style={styles.pickerText}>
                    {date ? date.toLocaleDateString() : 'Select Date'}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display="default"
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
                    value={time || new Date()}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                />
            )}
            <TouchableOpacity onPress={sendBookingRequest} style={styles.button}>
                <Text style={styles.buttonText}>Send Booking Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Back</Text>
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
        fontWeight: 'bold',
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
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    backButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 10,
        marginVertical: 5,
    },
    backButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default BookingDetails;