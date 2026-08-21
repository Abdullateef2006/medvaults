// First, create a custom CircularTabButton component
// Save this as @/components/CircularTabButton.tsx or .js



// Then update your TabLayout component:

import { Tabs } from 'expo-router';
import React from 'react';

import { CircularTabButton } from '@/components/CircularTabButton';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#009b7c",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#0f0f14",
          height: 70,
          borderTopWidth: 1,
          borderTopColor: '#374151',
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          paddingBottom: 10,
          paddingTop: 10,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={28} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="food_scan"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <FontAwesome name="qrcode" size={30} color="black" />,
          tabBarButton: CircularTabButton, // Use custom circular button
          tabBarShowLabel: false, // Hide the label for cleaner look
        }}
      />
      <Tabs.Screen
        name="scan_history"
        options={{
          title: 'Scan History',
          tabBarIcon: ({ color }) => <FontAwesome name="history" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="save_money"
        options={{
          title: 'Save money',
          tabBarIcon: ({ color }) => <FontAwesome name="bank" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gethealthtips"
        options={{
          title: 'Health Tips',
          tabBarIcon: ({ color }) => <FontAwesome name="heartbeat" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}



// import { View, Text } from 'react-native'
// import React from 'react'
// import { Tabs } from 'expo-router'
// import TabBar from "@/components/TabBar"
// import { HapticTab } from '@/components/HapticTab';

// const _layout = () => {
//   return (
//     <Tabs screenOptions={{
//       tabBarActiveTintColor: "#009b7c",
//       headerShown: false,
//       tabBarButton: HapticTab,
//       tabBarStyle: {
//         backgroundColor: "#0d0c0f",
//         height: 60,
//         borderWidth: 0
//       }
//     }}
//       tabBar={props => <TabBar {...props} />}
//     >
//       <Tabs.Screen
//         name="food_scan"
//         options={{
//           title: "Food Scan"
//         }}
//       />
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Index"
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile"
//         }}
//       />
//       {/* <Tabs.Screen
//             name="profile"
//             options={{
//                 title: "Profile"
//             }}
//         /> */}
//     </Tabs>
//   )
// }

// export default _layout