import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColor } from '../hooks/useThemeColor';

export default function FloatingChatButton() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const handlePress = () => {
    router.push('/medibot');
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: tintColor }]} // Use tintColor for button background
      onPress={handlePress}
    >
      <MaterialCommunityIcons name="chat" size={30} color={backgroundColor} /> // Use backgroundColor for icon color
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
