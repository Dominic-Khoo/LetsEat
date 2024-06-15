import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

interface ChatHeaderProps {
    friendName: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ friendName }) => {
    const router = useRouter();

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/social')} style={styles.backButton}>
                <Image source={require('../../../../assets/icons/left-chevron.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{friendName}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'brown',
    },
    backButton: {
        marginRight: 10,
        padding: 10, 
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold', 
        color: '#fff'
    },
});

export default ChatHeader;
