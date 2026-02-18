import 'react-native-get-random-values';
import { useEffect } from 'react';
import { View } from 'react-native'; // <--- Added this missing import
import { Stack } from 'expo-router';
import { initDB } from '../Services/DatabaseService';
import { LogOverlay } from './LogView'; // Ensure the path is correct

export default function RootLayout() {
  useEffect(() => {
    try {
      initDB();
    } catch (error) {
      console.error("Layout Init Error:", error);
    }
  }, []);

  const StackComponent = Stack as any;

  return (
    <View style={{ flex: 1 }}>
      <StackComponent
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0047AB',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'User Registration',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="chat" 
          options={{ 
            title: 'Aarogya Chatbot',
            headerShown: true,
            headerBackTitle: 'Back'
          }} 
        />
      </StackComponent>
      {/* This sits on top of everything so you can debug the AI */}
      <LogOverlay />
    </View>
  );
}