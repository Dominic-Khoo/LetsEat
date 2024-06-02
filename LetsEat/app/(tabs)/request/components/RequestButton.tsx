import { useState } from "react";
import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback} from "react-native";
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';


const RequestButton = () => {
    const [modalVisible, setModalVisible] = useState(false);

    function sendRequest() {
        setModalVisible(true);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={sendRequest}>
                <Text style={styles.buttonText}>Send Request</Text>
            </TouchableOpacity>
            <Modal animationType="slide" transparent={true} visible={modalVisible}
                   onRequestClose={() => {setModalVisible(false);}}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <BlurView style={styles.blurBG}
                                  intensity={50}
                                  tint='dark'
                        />
                        <View style={styles.popup}>
                            <TouchableOpacity style={[styles.popupButton, styles.openJioButton]} onPress={() => {setModalVisible(false);
                                                                                                                 router.push("/(eatrequests)/openjio");}}>
                                <Text style={[styles.popupText]}>Open Jio</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.popupButton, styles.bookingButton]} onPress={() => {setModalVisible(false);
                                                                                                                 router.push("/(eatrequests)/booking");}}>
                                <Text style={styles.popupText}>Booking</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.popupButton, styles.takeawayButton]} onPress={() => {}}>
                                <Text style={styles.popupText}>Takeaway</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        padding: 20
    },
    button: {
        borderRadius: 8,
        paddingVertical: 20,
        paddingHorizontal: 40,
        backgroundColor: '#ff7e00'
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Lato',
        textAlign: 'center'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurBG: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    popup: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 20,
        elevation: 5,
        width: '80%',
    },
    popupButton: {
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
    },
    openJioButton: {
        backgroundColor: '#C04000',
        borderColor: '##C04000',
    },
    bookingButton: {
        backgroundColor: '#C04000',
        borderColor: '#C04000',
    },
    takeawayButton: {
        backgroundColor: '#C04000',
        borderColor: '#C04000',
    },
    popupText: {
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center',
    },
    closeButton: {
        color: '#3182CE',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default RequestButton;