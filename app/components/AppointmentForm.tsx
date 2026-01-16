// app/components/AppointmentForm.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View
} from "react-native";
import { styles } from "../../styles/dashboardStyles";
import { API_BASE } from "../constants/api";
import { APPOINTMENT_TEXT, Lang } from "../constants/appointmentText";

export default function AppointmentForm({ lang }: { lang: Lang }) {
  const t = APPOINTMENT_TEXT[lang];

  const isDark = useColorScheme() === "dark";
  // App styles are hardcoded to Light Theme (#F9FAFB background), so we must force Dark Text.
  const textColor = "#111827";
  const placeholderColor = "#9CA3AF"; // Force standard placeholder color too for consistency

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [problem, setProblem] = useState("");

  // Date/Time State
  const [date, setDate] = useState(""); // Stores "DD/MM/YYYY" string for compatibility
  const [time, setTime] = useState(""); // Stores "HH:MM AM/PM" string for compatibility

  const [dateObj, setDateObj] = useState(new Date()); // Internal date object
  const [timeObj, setTimeObj] = useState(new Date()); // Internal time object

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      // ensure user is logged in
      const token = await AsyncStorage.getItem("sessionToken");
      if (!token) {
        Alert.alert("Not logged in", "Please login to book an appointment.");
        setLoading(false);
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
        setLoading(false);
        return;
      }

      Alert.alert(t.successTitle, t.successMsg);

      // reset form
      setFullName("");
      setMobile("");
      setAge("");
      setProblem("");
      setDate("");
      setTime("");
      setErrors({});
      setLoading(false);
    } catch (err) {
      console.error("create appointment error", err);
      Alert.alert("Error", "Submission failed. Please try again.");
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // Android: Event type "set" closes picker automatically.
    // iOS: Fires on every scroll.

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setDateObj(selectedDate);
        // Format: DD/MM/YYYY
        const d = selectedDate.getDate().toString().padStart(2, "0");
        const m = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
        const y = selectedDate.getFullYear();
        setDate(`${d}/${m}/${y}`);
      }
    } else {
      if (selectedDate) {
        setDateObj(selectedDate);
      }
    }
  };

  const confirmIosDate = () => {
    setShowDatePicker(false);
    const selectedDate = dateObj;
    const d = selectedDate.getDate().toString().padStart(2, "0");
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const y = selectedDate.getFullYear();
    setDate(`${d}/${m}/${y}`);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (selectedTime) {
        setTimeObj(selectedTime);
        // Format: HH:MM AM/PM
        let hours = selectedTime.getHours();
        const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        setTime(`${hours}:${minutes} ${ampm}`);
      }
    } else {
      // iOS: update internal object only
      if (selectedTime) {
        setTimeObj(selectedTime);
      }
    }
  };

  const confirmIosTime = () => {
    setShowTimePicker(false);
    const selectedTime = timeObj;
    let hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    setTime(`${hours}:${minutes} ${ampm}`);
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
        <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
          <View pointerEvents="none">
            <TextInput
              style={[styles.apptInput, { color: textColor }]}
              placeholder={t.datePh} // e.g. "DD/MM/YYYY"
              placeholderTextColor={placeholderColor}
              value={date}
            />
          </View>
        </TouchableOpacity>
        {errors.date && <Text style={styles.apptError}>{errors.date}</Text>}
      </View>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={showDatePicker}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <View style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              {/* Toolbar */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: '#EF4444', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{ fontWeight: '700', fontSize: 16 }}>Select Date</Text>
                <TouchableOpacity onPress={confirmIosDate}>
                  <Text style={{ color: '#2563EB', fontWeight: '800' }}>Confirm</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateObj}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={new Date()}
                textColor="black"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* TIME */}
      <View style={styles.apptFieldGroup}>
        <Text style={styles.apptLabel}>{t.time}</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} activeOpacity={0.8}>
          <View pointerEvents="none">
            <TextInput
              style={[styles.apptInput, { color: textColor }]}
              placeholder={t.timePh}
              placeholderTextColor={placeholderColor}
              value={time}
            />
          </View>
        </TouchableOpacity>
        {errors.time && <Text style={styles.apptError}>{errors.time}</Text>}
      </View>

      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={timeObj}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={showTimePicker}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <View style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              {/* Toolbar */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={{ color: '#EF4444', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{ fontWeight: '700', fontSize: 16 }}>Select Time</Text>
                <TouchableOpacity onPress={confirmIosTime}>
                  <Text style={{ color: '#2563EB', fontWeight: '800' }}>Confirm</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={timeObj}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                textColor="black"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* SUBMIT */}
      <TouchableOpacity
        style={[styles.apptButton, loading && { opacity: 0.7 }]}
        activeOpacity={0.9}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.apptButtonText}>{t.submit}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
