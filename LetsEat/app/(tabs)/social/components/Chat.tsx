import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GiftedChat, IMessage, Bubble, Day, InputToolbar, Composer, Send, InputToolbarProps, ComposerProps, SendProps } from 'react-native-gifted-chat';
import { getAuth } from 'firebase/auth';
import { ref, onValue, push, set, get } from 'firebase/database';
import { FIREBASE_DB } from '../../../../firebaseConfig';
import { useLocalSearchParams } from 'expo-router';
import ChatHeader from './ChatHeader'; // Import the ChatHeader component

const Chat = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [friend, setFriend] = useState<{ uid: string; username: string } | null>(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { friendUid } = useLocalSearchParams();

  // Ensure friendUid is a single string
  const friendUidStr = Array.isArray(friendUid) ? friendUid[0] : friendUid;

  useEffect(() => {
    if (currentUser && friendUidStr) {
      const friendRef = ref(FIREBASE_DB, `users/${friendUidStr}`);
      get(friendRef).then(snapshot => {
        if (snapshot.exists()) {
          const friendData = snapshot.val();
          setFriend({ uid: friendUidStr, username: friendData.username });
        }
      });

      const chatId = [currentUser.uid, friendUidStr].sort().join('_');
      const messagesRef = ref(FIREBASE_DB, `chats/${chatId}`);
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const formattedMessages = Object.keys(data)
            .map(key => ({
              _id: key,
              text: data[key].text,
              createdAt: new Date(data[key].createdAt),
              user: data[key].user,
            }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setMessages(formattedMessages);
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser, friendUidStr]);

  const onSend = useCallback((messages: IMessage[] = []) => {
    if (!currentUser || !friend) return;
    const chatId = [currentUser.uid, friend.uid].sort().join('_');
    const messagesRef = ref(FIREBASE_DB, `chats/${chatId}`);
    const { _id, createdAt, text, user } = messages[0];
    const newMessageRef = push(messagesRef);
    set(newMessageRef, {
      _id,
      text,
      createdAt: (createdAt as Date).toISOString(),
      user,
    });
  }, [currentUser, friend]);

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: 'brown',
          },
          right: {
            backgroundColor: 'brown',
          },
        }}
        textStyle={{
          left: {
            color: 'white',
            fontFamily: 'Poppins-SemiBold',
          },
          right: {
            color: 'white',
            fontFamily: 'Poppins-SemiBold',
          },
        }}
      />
    );
  };

  const renderDay = (props: any) => {
    return (
      <Day
        {...props}
        textStyle={{
          color: 'white',
          fontFamily: 'Poppins-SemiBold',
        }}
      />
    );
  };

  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: 'brown',
          borderTopColor: 'transparent',
          padding: 4,
        }}
      />
    );
  };

  const renderComposer = (props: ComposerProps) => {
    return (
      <Composer
        {...props}
        textInputStyle={{
          color: 'white',
          backgroundColor: 'brown',
          borderRadius: 15,
          padding: 8,
          fontFamily: 'Poppins-SemiBold',
          fontSize: 14,
        }}
        placeholderTextColor="white"
      />
    );
  };

  const renderSend = (props: SendProps<IMessage>) => {
    return (
      <Send
        {...props}
        containerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <Text style={styles.sendButton}>Send</Text>
      </Send>
    );
  };

  if (!currentUser || !friend) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ChatHeader friendName={friend.username} />
      <GiftedChat
        messages={messages}
        onSend={(messages: IMessage[]) => onSend(messages)}
        user={{
          _id: currentUser.uid,
          name: currentUser.displayName ?? '',
          avatar: currentUser.photoURL || 'https://placeimg.com/140/140/any',
        }}
        renderBubble={renderBubble}
        renderDay={renderDay}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9be91',
  },
  sendButton: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default Chat;
