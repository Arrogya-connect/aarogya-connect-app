// app/components/AppointmentForm.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { styles } from "../../styles/dashboardStyles";
import { API_BASE } from "../constants/api";
import { APPOINTMENT_TEXT, Lang } from "../constants/appointmentText";

export default function AppointmentForm({ lang }: { lang: Lang }) {
  const t = APPOINTMENT_TEXT[lang];

  const isDark = useColorScheme() === "dark";
  const textColor = isDark ? " #111827#FFFFFF" : "#FFFFFF";
  const placeholderColor = isDark ? "#D1D5DB" : "#9CA3AF";

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [problem, setProblem] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  // API_BASE imported from constants

  const [errors, setErrors] = useState<{
    fullName?: string;
    mobile?: string;
    age?: string;
    problem?: string;
    date?: string;
    time?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    const dateRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    const timeRegex =
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = t.errors.name;
    }

    if (mobile.length !== 10) {
      newErrors.mobile = t.errors.mobile;
    }

    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      newErrors.age = t.errors.age;
    }

    if (!problem.trim() || problem.trim().length < 5) {
      newErrors.problem = t.errors.problem;
    }

    if (!date.trim()) newErrors.date = t.errors.date;
    else if (!dateRegex.test(date.trim()))
      newErrors.date = t.errors.date;

    if (!time.trim()) newErrors.time = t.errors.time;
    else if (!timeRegex.test(time.trim()))
      newErrors.time = t.errors.time;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      // ensure user is logged in
      const token = await AsyncStorage.getItem("sessionToken");
      if (!token) {
        Alert.alert("Not logged in", "Please login to book an appointment.");
        return;
      }

      const payload = {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        age: Number(age),
        problem: problem.trim(),
        preferredDate: date.trim(),
        preferredTime: time.trim(),
      };

      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const err = json.error || "Failed to create appointment";
        Alert.alert("Error", err);
        return;
      }

      Alert.alert(t.successTitle, t.successMsg);

      // reset form (same as before)
      setFullName("");
      setMobile("");
      setAge("");
      setProblem("");
      setDate("");
      setTime("");
      setErrors({});
    } catch (err) {
      console.error("create appointment error", err);
      Alert.alert("Error", "Submission failed. Please try again.");
    }
  };
  return (
    <View style={styles.apptCard}>
      <Text style={styles.apptTitle}>{t.title}</Text>
      <Text style={styles.apptSubtitle}>{t.subtitle}</Text>

      {/* FULL NAME */}
      <View style={styles.apptFieldGroup}>
        <Text style={styles.apptLabel}>{t.fullName}</Text>
        <TextInput
          style={[styles.apptInput, { color: textColor }]}
          placeholder={t.fullNamePh}
          placeholderTextColor={placeholderColor}
          value={fullName}
          onChangeText={setFullName}
        />
        {errors.fullName && <Text style={styles.apptError}>{errors.fullName}</Text>}
      </View>

      {/* MOBILE + AGE */}
      <View style={styles.apptRow}>
        <View style={[styles.apptFieldGroup, { flex: 1, marginRight: 6 }]}>
          <Text style={styles.apptLabel}>{t.mobile}</Text>
          <TextInput
            style={[styles.apptInput, { color: textColor }]}
            placeholder={t.mobilePh}
            placeholderTextColor={placeholderColor}
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={(v) => setMobile(v.replace(/\D/g, "").slice(0, 10))}
            maxLength={10}
          />
          {errors.mobile && <Text style={styles.apptError}>{errors.mobile}</Text>}
        </View>

        <View style={[styles.apptFieldGroup, { width: 80, marginLeft: 6 }]}>
          <Text style={styles.apptLabel}>{t.age}</Text>
          <TextInput
            style={[styles.apptInput, { color: textColor }]}
            placeholder={t.age}
            placeholderTextColor={placeholderColor}
            keyboardType="number-pad"
            value={age}
            onChangeText={(v) => setAge(v.replace(/\D/g, "").slice(0, 3))}
            maxLength={3}
          />
          {errors.age && <Text style={styles.apptError}>{errors.age}</Text>}
        </View>
      </View>

      {/* PROBLEM */}
      <View style={styles.apptFieldGroup}>
        <Text style={styles.apptLabel}>{t.problem}</Text>
        <TextInput
          style={[styles.apptInput, styles.apptTextarea, { color: textColor }]}
          placeholder={t.problemPh}
          placeholderTextColor={placeholderColor}
          multiline
          value={problem}
          onChangeText={setProblem}
        />
        {errors.problem && <Text style={styles.apptError}>{errors.problem}</Text>}
      </View>

      {/* DATE */}
      <View style={styles.apptFieldGroup}>
        <Text style={styles.apptLabel}>{t.date}</Text>
        <TextInput
          style={[styles.apptInput, { color: textColor }]}
          placeholder={t.datePh}
          placeholderTextColor={placeholderColor}
          value={date}
          onChangeText={setDate}
        />
        {errors.date && <Text style={styles.apptError}>{errors.date}</Text>}
      </View>

      {/* TIME */}
      <View style={styles.apptFieldGroup}>
        <Text style={styles.apptLabel}>{t.time}</Text>
        <TextInput
          style={[styles.apptInput, { color: textColor }]}
          placeholder={t.timePh}
          placeholderTextColor={placeholderColor}
          value={time}
          onChangeText={setTime}
        />
        {errors.time && <Text style={styles.apptError}>{errors.time}</Text>}
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        style={styles.apptButton}
        activeOpacity={0.9}
        onPress={handleSubmit}
      >
        <Text style={styles.apptButtonText}>{t.submit}</Text>
      </TouchableOpacity>
    </View>
  );
}
