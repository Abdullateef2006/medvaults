import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Stack } from 'expo-router';

const MEDIBOT_API_ENDPOINT = 'YOUR_MEDIBOT_API_ENDPOINT_HERE'; // TODO: Replace with your actual API endpoint

export default function MediBotChatScreen() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello! I am MediBot. How can I assist you today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'MediBot',
          avatar: 'https://placeimg.com/140/140/any', // Placeholder avatar
        },
      },
    ]);
  }, []);

  const onSend = useCallback(async (messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

    const userMessage = messages[0].text;
    setTyping(true);

    try {
      const response = await fetch(MEDIBOT_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: data.reply, // Assuming the API returns a 'reply' field
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'MediBot',
          avatar: 'https://placeimg.com/140/140/any',
        },
      };

      setMessages(previousMessages => GiftedChat.append(previousMessages, [botMessage]));
    } catch (error) {
      console.error('Error sending message to MediBot:', error);
      setMessages(previousMessages => GiftedChat.append(previousMessages, [
        {
          _id: Math.round(Math.random() * 1000000),
          text: "Sorry, I'm having trouble connecting right now. Please try again later.",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'MediBot',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ]));
    } finally {
      setTyping(false);
    }
  }, []);

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'MediBot Chat' }} />
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
        }}
        renderBubble={(props) => {
          const isUser = props.currentMessage.user._id === 1;
          return (
            <View style={[
              styles.bubble,
              {
                backgroundColor: isUser ? tintColor : textColor,
                alignSelf: isUser ? 'flex-end' : 'flex-start',
              }
            ]}>
              <ThemedText style={{ color: isUser ? backgroundColor : tintColor }}>
                {props.currentMessage.text}
              </ThemedText>
            </View>
          );
        }}
        renderInputToolbar={(props) => (
          <View style={[styles.inputToolbar, { backgroundColor: backgroundColor }]}>
            <GiftedChat.InputToolbar {...props}
              containerStyle={{
                backgroundColor: backgroundColor,
                borderTopColor: tintColor,
              }}
              textInputStyle={{
                color: textColor,
              }}
            />
          </View>
        )}
        renderDay={(props) => (
          <ThemedText style={styles.dateText}>{props.currentMessage.createdAt.toLocaleDateString()}</ThemedText>
        )}
        renderTime={(props) => (
          <ThemedText style={styles.timeText}>{props.currentMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
        )}
        renderAvatar={null} // Hide avatars for a cleaner look
        renderFooter={() => typing ? <ActivityIndicator style={styles.typingIndicator} size="small" color={tintColor} /> : null}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bubble: {
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  inputToolbar: {
    borderTopWidth: 1,
  },
  dateText: {
    textAlign: 'center',
    marginVertical: 5,
    fontSize: 12,
  },
  timeText: {
    fontSize: 10,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  typingIndicator: {
    marginBottom: 10,
  },
});
