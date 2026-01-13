import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API_BASE } from "./constants/api";

export default function EditFieldScreen() {
  const { field, value } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [text, setText] = useState(value as string);
  const [saving, setSaving] = useState(false);

  const title =
    field === "phone"
      ? "Edit Phone Number"
      : field === "email"
        ? "Edit Email"
        : "Edit";

  const handleSave = async () => {
    if (!text || !text.toString().trim()) {
      Alert.alert("Validation", "Please enter a value");
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("sessionToken");
      if (!token) {
        Alert.alert("Not logged in", "Please login and try again.");
        setSaving(false);
        return;
      }

      const payload: any = {};
      if (field === "phone") payload.phone = text;
      else if (field === "email") payload.email = text;
      else payload[field as string] = text;

      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        const err = json.error || "Failed to update profile";
        Alert.alert("Error", err);
        setSaving(false);
        return;
      }

      // Save updated user locally and go back to profile (so profile reloads)
      await AsyncStorage.setItem("user", JSON.stringify(json.user));
      router.replace("/profile-screen");
    } catch (err) {
      console.error("save profile field error", err);
      Alert.alert("Network error", "Could not reach server. Try again.");
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#F6F7FB"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, paddingTop: insets.top + 20 }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            keyboardType={field === "phone" ? "phone-pad" : "email-address"}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    fontSize: 16,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});