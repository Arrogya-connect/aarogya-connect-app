import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DatabaseService from '../Services/DatabaseService';
import ChatbotEngine from '../Services/ChatbotEngine';

export default function RegistrationScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('both');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (num: string) => {
    const reg = /^[0-9]{10}$/;
    return reg.test(num);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = await DatabaseService.registerUser(name, phone);
      if (userId) {
        ChatbotEngine.setUser(userId);
        ChatbotEngine.context.gender = gender;
        router.push('/chat');
      } else {
        Alert.alert('Database Error', 'Could not save user data. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Check system logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = () => {
    ChatbotEngine.setUser('Guest');
    ChatbotEngine.context.gender = 'both';
    router.push('/chat');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.appTitle}>Aarogya Connect</Text>
          <Text style={styles.appSubtitle}>Rural Health AI Assistant</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {['male', 'female', 'both'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.genderButton,
                  gender === item && styles.genderButtonActive,
                ]}
                onPress={() => setGender(item)}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === item && styles.genderTextActive,
                  ]}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.mainButton, isSubmitting && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            <Text style={styles.mainButtonText}>
              {isSubmitting ? 'Registering...' : 'Start Consultation'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built for Offline Clinical Support in Rural India
          </Text>
          <Text style={styles.versionText}>v1.0.0 (ONNX Hybrid RAG)</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0047AB',
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#657786',
    marginTop: 5,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1E21',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E4E6EB',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#0047AB',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#0047AB',
  },
  genderText: {
    color: '#0047AB',
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#FFFFFF',
  },
  mainButton: {
    backgroundColor: '#0047AB',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: '#A0BCE0',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#657786',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#B0B3B8',
    textAlign: 'center',
  },
  versionText: {
    fontSize: 10,
    color: '#B0B3B8',
    marginTop: 5,
  },
});