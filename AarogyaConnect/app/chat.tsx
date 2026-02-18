import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have @expo/vector-icons installed
import ChatbotEngine from '../Services/ChatbotEngine';
import RAGService from '../Services/RAGService';

// Types for chat bubbles
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'chat' | 'option'; // Added support for options
  options?: { label: string; value: string }[]; // Array for buttons
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiReady, setIsAiReady] = useState(false);
  
  // New State for Rich UI
  const [currentOptions, setCurrentOptions] = useState<{ label: string; value: string }[] | null>(null);
  const [showMediaUpload, setShowMediaUpload] = useState(false); // Triggers camera button

  const scrollViewRef = useRef<ScrollView>(null);

  // 1. Initial Setup
  useEffect(() => {
    const initSystem = async () => {
      try {
        await RAGService.loadModel();
        setIsAiReady(true);

        // Start the conversation (Engine is in IDLE, this triggers the Greeting)
        const response = await ChatbotEngine.handleInput('');
        processBotResponse(response);
      } catch (error) {
        console.error("Initialization Error:", error);
        addBotMessage("⚠️ System Error: Failed to load the AI Brain.");
      }
    };

    initSystem();
  }, []);

  // 2. Helper to Process Engine Responses
  const processBotResponse = (response: any) => {
    if (!response || !response.text) return;

    // Add the text message
    addBotMessage(response.text);

    // Handle Options (Buttons)
    if (response.type === 'option' && response.options) {
      setCurrentOptions(response.options);
    } else {
      setCurrentOptions(null);
    }

    // Handle Actions (e.g., Low Urgency -> Camera)
    if (response.action === 'REQUEST_MEDIA') {
      setShowMediaUpload(true);
    } else {
      setShowMediaUpload(false);
    }
  };

  const addBotMessage = (text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // 3. Handle User Input (Text or Option Selection)
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputText.trim();
    if (!textToSend || isLoading) return;

    setInputText('');
    setCurrentOptions(null); // Hide buttons after selection
    setIsLoading(true);

    // Add user message to UI
    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Send to Engine
      const response = await ChatbotEngine.handleInput(textToSend);
      
      setIsLoading(false);
      
      // Process the response
      if (response) {
        processBotResponse(response);
      } else {
        addBotMessage("I didn't understand that. Could you try again?");
      }

    } catch (error) {
      console.error(error);
      addBotMessage("Error processing response. Please try again.");
      setIsLoading(false);
    }
  }

  // Dummy Handler for Media Upload
  const handleMediaUpload = () => {
    Alert.alert("Camera Feature", "Opening Camera for recording... (Feature to be implemented)");
    // After upload, you might want to send a hidden message to the bot like "MEDIA_UPLOADED"
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.statusHeader}>
        <Text style={styles.statusText}>
          AI Engine: {isAiReady ? "✅ Online" : "⏳ Loading..."}
        </Text>
      </View>

      <ScrollView 
        style={styles.chatArea}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.bubble, 
              msg.sender === 'user' ? styles.userBubble : styles.botBubble
            ]}
          >
            <Text style={msg.sender === 'user' ? styles.userText : styles.botText}>
              {msg.text}
            </Text>
            <Text style={styles.timestamp}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        
        {isLoading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#0047AB" />
          </View>
        )}
      </ScrollView>

      {/* DYNAMIC FOOTER: Shows Options, Media Button, or Text Input */}
      <View style={styles.inputContainer}>
        
        {/* CASE A: Show Option Buttons (e.g. Male/Female) */}
        {currentOptions ? (
          <View style={styles.optionsContainer}>
            {currentOptions.map((opt) => (
              <TouchableOpacity 
                key={opt.value} 
                style={styles.optionButton}
                onPress={() => handleSend(opt.value)} // Send the option value as text
              >
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : showMediaUpload ? (
          /* CASE B: Show Media Upload Button (Low Urgency) */
          <TouchableOpacity style={styles.mediaButton} onPress={handleMediaUpload}>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.mediaButtonText}>Record Video / Photo</Text>
          </TouchableOpacity>
        ) : (
          /* CASE C: Standard Text Input */
          <>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your response..."
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.disabledButton]} 
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  statusHeader: {
    backgroundColor: '#E1E8ED',
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CCD6DD',
  },
  statusText: {
    fontSize: 12,
    color: '#657786',
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
    padding: 15,
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
    maxWidth: '85%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0047AB',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
  },
  userText: { color: '#FFFFFF', fontSize: 15 },
  botText: { color: '#1C1E21', fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 10, color: '#B0B3B8', marginTop: 4, alignSelf: 'flex-end' },
  loadingBubble: { alignSelf: 'flex-start', padding: 10, marginLeft: 10 },
  
  // Input Area Styles
  inputContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
    alignItems: 'center',
    flexDirection: 'row', 
    minHeight: 70, // Ensure height for options
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#0047AB',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#A0BCE0' },
  
  // Option Buttons Styles
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#E8F0FE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0047AB',
  },
  optionText: {
    color: '#0047AB',
    fontWeight: '600',
  },

  // Media Button Styles
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#28a745', // Green for action
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16
  }
});