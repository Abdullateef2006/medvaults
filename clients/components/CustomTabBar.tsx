// components/CustomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isScanTab = route.name === 'food_scan';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isScanTab) {
            return (
              <ScanTabButton
                key={route.key}
                onPress={onPress}
                icon={options.tabBarIcon({ color: 'white' })}
              />
            );
          }

          return (
            <TabButton
              key={route.key}
              onPress={onPress}
              icon={options.tabBarIcon({ color: isFocused ? '#009b7c' : '#6b7280' })}
              label={options.title || route.name}
              isFocused={isFocused}
            />
          );
        })}
      </View>
    </View>
  );
};

const TabButton = ({ onPress, icon, label, isFocused }: any) => {
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {icon}
        <Text style={[styles.label, isFocused && styles.labelFocused]}>
          {label}
        </Text>
      </View>
      {isFocused && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
};

const ScanTabButton = ({ onPress, icon }: any) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.scanButtonContainer, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.scanButtonInner}>
          {icon}
        </View>
        <View style={styles.scanButtonGlow} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#0d0c0f',
    borderTopWidth: 1,
    borderTopColor: '#1f1b24',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    fontFamily: 'Inter-Medium',
  },
  labelFocused: {
    color: '#009b7c',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 10,
    height: 3,
    width: 20,
    backgroundColor: '#009b7c',
    borderRadius: 2,
  },
  scanButtonContainer: {
    top: -25,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0d0c0f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#009b7c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#009b7c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#009b7c',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  scanButtonGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
});