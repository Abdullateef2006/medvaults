// stores/userStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/assets/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useUserStore = create(
  persist(
    (set) => ({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      isLoading: false,
      error: null,
      
      fetchUserData: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/get_user_info/');
          set({
            username: response.data.username,
            email: response.data.email,
            firstName: response.data.firstname,
            lastName: response.data.lastname,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: 'Failed to fetch user data',
            isLoading: false 
          });
        }
      },
      
      clearUserData: () => {
        set({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage), // or AsyncStorage for React Native
    }
  )
);