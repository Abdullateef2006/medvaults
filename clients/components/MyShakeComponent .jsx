// import React, { useEffect, useState, useCallback } from 'react';
// import { DeviceMotion } from 'expo-sensors';
// import { SendEmergencyAlert } from './Emergency';
// import { Vibration } from 'react-native';

// export default function ShakeDetector() {
//   const [lastShake, setLastShake] = useState(Date.now());
//   const [isSending, setIsSending] = useState(false);

//   const handleShake = useCallback(async () => {
//     if (isSending) return;
    
//     setIsSending(true);
//     try {
//       Vibration.vibrate(500); // Provide haptic feedback
//       console.log('Shake detected! Sending alert...');
//       await SendEmergencyAlert();
//     } catch (error) {
//       console.error('Alert sending failed:', error);
//     } finally {
//       setIsSending(false);
//     }
//   }, [isSending]);

  // useEffect(() => {
  //   const threshold = 30; // Adjust sensitivity as needed
  //   const cooldown = 2000; // 2 seconds between shakes
    
  //   const subscription = DeviceMotion.addListener(({ accelerationIncludingGravity }) => {
  //     const { x = 0, y = 0, z = 0 } = accelerationIncludingGravity ?? {};
  //     const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);

  //     if (totalForce > threshold) {
  //       const now = Date.now();
  //       if (now - lastShake > cooldown) {
  //         setLastShake(now);
  //         handleShake();
  //       }
  //     }
  //   });

//     DeviceMotion.setUpdateInterval(300);

//     return () => {
//       subscription.remove();
//     };
//   }, [lastShake, handleShake]);

//   return null;
// }




// import React, { useEffect, useState, useCallback } from 'react';
// import { DeviceMotion, Vibration } from 'expo-sensors';
// import { Audio } from 'expo-av';
// import { SendEmergencyAlert } from './Emergency';
// import { Modal, View, Text, StyleSheet, Button } from 'react-native';

// export default function ShakeDetector() {
//   const [lastShake, setLastShake] = useState(Date.now());
//   const [isSending, setIsSending] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [countdown, setCountdown] = useState(10);
//   const [countdownInterval, setCountdownInterval] = useState(null);
//   const [sound, setSound] = useState(null);

//   const playAlarm = useCallback(async () => {
//     try {
//       const { sound } = await Audio.Sound.createAsync(
//         require('./assets/alarm.mp3'), // Make sure the file exists
//         { isLooping: true }
//       );
//       setSound(sound);
//       await sound.playAsync();
//     } catch (error) {
//       console.warn('Failed to play alarm:', error);
//     }
//   }, []);

//   const stopAlarm = useCallback(async () => {
//     if (sound) {
//       try {
//         await sound.stopAsync();
//         await sound.unloadAsync();
//       } catch (error) {
//         console.warn('Failed to stop alarm:', error);
//       } finally {
//         setSound(null);
//       }
//     }
//   }, [sound]);

//   const handleShake = useCallback(async () => {
//     if (isSending || showConfirmation) return;

//     Vibration.vibrate(100); // Short vibration for detection
//     setShowConfirmation(true);
//     setCountdown(10);
//     playAlarm();

//     const interval = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     setCountdownInterval(interval);
//   }, [isSending, showConfirmation, playAlarm]);

//   const confirmSendAlert = useCallback(async () => {
//     if (isSending) return;

//     if (countdownInterval) {
//       clearInterval(countdownInterval);
//       setCountdownInterval(null);
//     }

//     await stopAlarm();
//     setShowConfirmation(false);
//     setIsSending(true);

//     try {
//       Vibration.vibrate([0, 250, 100, 250]);
//       console.log('Sending emergency alert...');
//       await SendEmergencyAlert();
//     } catch (error) {
//       console.error('Alert sending failed:', error);
//     } finally {
//       setIsSending(false);
//     }
//   }, [isSending, countdownInterval, stopAlarm]);

//   const cancelAlert = useCallback(async () => {
//     if (countdownInterval) {
//       clearInterval(countdownInterval);
//       setCountdownInterval(null);
//     }

//     await stopAlarm();
//     setShowConfirmation(false);
//     setCountdown(10);
//   }, [countdownInterval, stopAlarm]);

//   useEffect(() => {
//     if (countdown === 0 && showConfirmation) {
//       confirmSendAlert();
//     }
//   }, [countdown, showConfirmation, confirmSendAlert]);

//   useEffect(() => {
//     const threshold = 25;
//     const cooldown = 3000;

//     const subscription = DeviceMotion.addListener(({ accelerationIncludingGravity }) => {
//       const { x = 0, y = 0, z = 0 } = accelerationIncludingGravity ?? {};
//       const totalForce = Math.sqrt(x * x + y * y + z * z);

//       if (totalForce > threshold) {
//         const now = Date.now();
//         if (now - lastShake > cooldown) {
//           setLastShake(now);
//           handleShake();
//         }
//       }
//     });

//     DeviceMotion.setUpdateInterval(250);

//     return () => {
//       subscription.remove();
//       if (countdownInterval) {
//         clearInterval(countdownInterval);
//       }
//     };
//   }, [lastShake, handleShake, countdownInterval]);

//   return (
//     <Modal
//       transparent={true}
//       visible={showConfirmation}
//       animationType="slide"
//       onRequestClose={cancelAlert}
//     >
//       <View style={styles.centeredView}>
//         <View style={styles.modalView}>
//           <Text style={styles.modalTitle}>Emergency Alert</Text>
//           <Text style={styles.modalText}>
//             Are you in an emergency? The alert will be sent automatically in {countdown} seconds.
//           </Text>
//           <View style={styles.buttonContainer}>
//             <View style={styles.buttonWrapper}>
//               <Button
//                 title="Cancel"
//                 onPress={cancelAlert}
//                 color="#FF3B30"
//               />
//             </View>
//             <View style={styles.buttonWrapper}>
//               <Button
//                 title="Send Now"
//                 onPress={confirmSendAlert}
//                 color="#34C759"
//               />
//             </View>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   centeredView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalView: {
//     margin: 20,
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 25,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     width: '80%',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   modalText: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   buttonWrapper: {
//     flex: 1,
//     marginHorizontal: 5,
//   },
// });
import React, { useEffect, useState, useCallback } from 'react';
import { DeviceMotion } from 'expo-sensors';
import { Audio } from 'expo-av';
import { Vibration, Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SendEmergencyAlert } from './Emergency';
import { ActivateQRCode } from './Activateqrcode'; // Ensure this is a named export, not default

const { width } = Dimensions.get('window');

export default function ShakeDetector() {
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [sound, setSound] = useState(null);

  // Play alarm
  const playAlarm = useCallback(async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/alarm.wav'),
        { isLooping: true }
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.warn('Error playing alarm sound:', error);
    }
  }, []);

  // Stop alarm
  const stopAlarm = useCallback(async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.warn('Error stopping alarm sound:', error);
      } finally {
        setSound(null);
      }
    }
  }, [sound]);

  // Trigger QR Code Activation
  const triggerQRCodeActivation = useCallback(async () => {
    try {
      const data = await ActivateQRCode();
      console.log('QR Code Activated:', data);
    } catch (error) {
      console.error('QR code activation failed:', error);
    }
  }, []);

  // Show confirmation modal and start countdown
  const handleEmergencyTrigger = useCallback(() => {
    if (isSending || showConfirmation) return;

    Vibration.vibrate(100);
    setShowConfirmation(true);
    setCountdown(10);
    playAlarm();

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setCountdownInterval(interval);
  }, [isSending, showConfirmation, playAlarm]);

  // Confirm sending emergency alert manually
  const confirmSendAlert = useCallback(async () => {
    if (isSending) return;

    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }

    await stopAlarm();
    setShowConfirmation(false);
    setIsSending(true);

    try {
      Vibration.vibrate([0, 250, 100, 250]);
      
      // Activate QR code independently so it works even if SMS/email fails
      triggerQRCodeActivation().catch(e => console.error('QR activation failed independently:', e));
      
      // Send emergency alert
      await SendEmergencyAlert();
    } catch (error) {
      console.error('Alert sending failed:', error);
    } finally {
      setIsSending(false);
    }
  }, [isSending, countdownInterval, stopAlarm, triggerQRCodeActivation]);

  // Cancel the alert
  const cancelAlert = useCallback(async () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }

    await stopAlarm();
    setShowConfirmation(false);
    setCountdown(10);
  }, [countdownInterval, stopAlarm]);

  // Auto-send alert after countdown
  useEffect(() => {
    if (countdown === 0 && showConfirmation) {
      confirmSendAlert(); // This will call triggerQRCodeActivation inside
    }
  }, [countdown, showConfirmation, confirmSendAlert]);

  // Shake detection logic
  useEffect(() => {
    const SHAKE_THRESHOLD = 50;
    const SHAKE_COOLDOWN = 2000;
    let lastShake = 0;

    const subscription = DeviceMotion.addListener(({ accelerationIncludingGravity }) => {
      const { x = 0, y = 0, z = 0 } = accelerationIncludingGravity ?? {};
      const now = Date.now();
      const accMag = Math.sqrt(x * x + y * y + z * z);

      if (accMag > SHAKE_THRESHOLD && now - lastShake > SHAKE_COOLDOWN) {
        lastShake = now;
        handleEmergencyTrigger();
        console.log(`shake detected ${accMag}`);
      }
    });

    DeviceMotion.setUpdateInterval(200);

    return () => {
      subscription.remove();
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [handleEmergencyTrigger, countdownInterval]);

  return (
    <Modal
      transparent={true}
      visible={showConfirmation}
      animationType="fade"
      onRequestClose={cancelAlert}
    >
      <View style={styles.container}>
        <View style={styles.modalView}>
          <View style={styles.alertHeader}>
            <View style={styles.alertIcon}>
              <MaterialIcons name="emergency" size={24} color="#fff" />
            </View>
            <Text style={styles.alertTitle}>Emergency Alert</Text>
          </View>

          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{countdown}</Text>
            <Text style={styles.countdownLabel}>seconds remaining</Text>
          </View>

          <Text style={styles.alertMessage}>
            Emergency services will be notified automatically in {countdown} seconds.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={cancelAlert}
              disabled={isSending}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]}
              onPress={confirmSendAlert}
              disabled={isSending}
            >
              <Text style={styles.buttonText}>Send Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 20, 0.9)',
    padding: 24,
  },
  modalView: {
    width: width - 48,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: 4,
  },
  countdownLabel: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  alertMessage: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
