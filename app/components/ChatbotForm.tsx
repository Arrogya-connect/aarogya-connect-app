
import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { JSX, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/dashboardStyles";
import { CHATBOT_TEXT, Lang } from "../constants/chatbotText";

type MediaItem = { uri: string; type: "image" | "video"; name?: string };

import { API_BASE } from "../constants/api";

export default function ChatbotForm({ lang }: { lang: Lang }): JSX.Element {
  const t = CHATBOT_TEXT[lang];

  // ---------- Form State ----------
  const [queryNumber, setQueryNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [attachments, setAttachments] = useState<MediaItem[]>([]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});


  const sanitizeDigits = (text: string) => text.replace(/\D/g, "");

  // ---------- Media Picker ----------
  const pickMedia = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm?.status !== "granted") {
        Alert.alert(t.title, "Gallery permission required.");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: 3 - attachments.length,
        quality: 0.6,
      });

      if (res.canceled) return;

      const assets = res.assets || [];
      const picked: MediaItem[] = assets.map((a) => ({
        uri: a.uri,
        type: a.type === "video" ? "video" : "image",
        name: a.uri.split("/").pop(),
      }));

      setAttachments((prev) => [...prev, ...picked].slice(0, 3));
    } catch (err) {
      console.error("Media Picker Error:", err);
    }
  };






  // ---------- Validation ----------
  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!queryNumber.trim()) e.queryNumber = t.errors.queryNumber;
    const ph = sanitizeDigits(phone);
    if (!/^\d{10}$/.test(ph)) e.phone = t.errors.phone;
    if (!summary.trim() && attachments.length === 0) {
      e.content = t.errors.content;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------- Helper to normalize URIs for upload ----------
  async function normalizeUriForUpload(uri: string | null) {
    if (!uri) return null;
    try {
      // Android content:// URIs need copying to a file path
      if (Platform.OS === "android" && uri.startsWith("content://")) {
        const dest = `${FileSystem.cacheDirectory}${Date.now()}-${uri.split("/").pop()}`;
        await FileSystem.copyAsync({ from: uri, to: dest });
        return dest;
      }
      // If the uri exists return it, otherwise try copying to cache
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) return uri;
      const dest = `${FileSystem.cacheDirectory}${Date.now()}-${uri.split("/").pop()}`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch (e) {
      console.warn("normalizeUriForUpload failed", e, uri);
      return null;
    }
  }

  // ---------- Submit & Backend Integration ----------
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const token = await AsyncStorage.getItem("sessionToken");
      if (!token) {
        Alert.alert("Not logged in", "Please login to submit the query.");
        return;
      }

      const form = new FormData();
      form.append("queryNumber", queryNumber || "");
      form.append("phone", phone || "");
      form.append("summary", summary || "");

      // attachments array: { uri, type, name }
      for (let i = 0; i < attachments.length; i++) {
        const a = attachments[i];
        const uploadUri = await normalizeUriForUpload(a.uri);
        if (!uploadUri) continue;
        const name = a.name || `attachment-${Date.now()}-${i}`;
        const mime =
          a.type === "image" ? "image/jpeg" : a.type === "video" ? "video/mp4" : "application/octet-stream";
        form.append("attachments", {
          uri: uploadUri,
          name,
          type: mime,
        } as any);
      }



      console.log("Submitting chatbot query", {
        attachmentsCount: attachments.length,
        phone,
        queryNumber,
        summary,
      });

      const res = await fetch(`${API_BASE}/api/records`, {
        method: "POST",
        headers: {
          "x-session-token": token,
          // DO NOT set Content-Type for multipart form-data.
        },
        body: form,
      });

      const json = await res.json();
      console.log("Chatbot submit response:", res.status, json);

      if (!res.ok || !json.ok) {
        const err = json.error || "Submission failed";
        Alert.alert("Error", err);
        return;
      }

      Alert.alert(t.successTitle || "Submitted", "Your chatbot query was saved (pending).");

      // reset form fields
      setQueryNumber("");
      setPhone("");
      setSummary("");
      setAttachments([]);

      setErrors({});
    } catch (err: any) {
      console.error("chatbot submit error", err);
      const msg = err?.message || String(err);
      Alert.alert("Network error", msg.includes("Network request failed") ? "Network request failed — check API_BASE and device/network." : msg);
    }
  };

  return (
    <View style={styles.apptCard}>
      <View style={styles.chatbotHeaderRow}>
        <Text style={styles.apptTitle}>{t.title}</Text>
        <MaterialIcons name="smartphone" size={20} color="#6B7280" />
      </View>

      <Text style={styles.apptSubtitle}>{t.subtitle}</Text>

      {/* Query Number */}
      <View style={styles.apptFieldGroup}>
        <View style={styles.chatbotLabelRow}>
          <Feather name="hash" size={16} color="#374151" style={{ marginRight: 6 }} />
          <Text style={styles.apptLabel}>{t.queryNumber}</Text>
        </View>
        <TextInput
          style={styles.apptInput}
          placeholder={t.queryNumberPh}
          placeholderTextColor="#9CA3AF"
          value={queryNumber}
          onChangeText={(txt) => setQueryNumber(txt.replace(/\s/g, ""))}
        />
        {errors.queryNumber && <Text style={styles.apptError}>{errors.queryNumber}</Text>}
      </View>

      {/* Phone Number */}
      <View style={styles.apptFieldGroup}>
        <View style={styles.chatbotLabelRow}>
          <Feather name="phone" size={16} color="#374151" style={{ marginRight: 6 }} />
          <Text style={styles.apptLabel}>{t.phone}</Text>
        </View>
        <TextInput
          style={styles.apptInput}
          placeholder={t.phonePh}
          keyboardType="phone-pad"
          placeholderTextColor="#9CA3AF"
          value={phone}
          onChangeText={(txt) => setPhone(sanitizeDigits(txt).slice(0, 10))}
        />
        {errors.phone && <Text style={styles.apptError}>{errors.phone}</Text>}
      </View>

      {/* Summary */}
      <View style={styles.apptFieldGroup}>
        <View style={styles.chatbotLabelRow}>
          <Feather name="file-text" size={16} color="#374151" style={{ marginRight: 6 }} />
          <Text style={styles.apptLabel}>{t.summary}</Text>
        </View>
        <TextInput
          style={[styles.apptInput, styles.apptTextarea]}
          placeholder={t.summaryPh}
          placeholderTextColor="#9CA3AF"
          multiline
          value={summary}
          onChangeText={setSummary}
        />
      </View>

      {/* Media Attachments */}
      <View style={styles.apptFieldGroup}>
        <View style={styles.chatbotLabelRow}>
          <Feather name="image" size={16} color="#374151" style={{ marginRight: 6 }} />
          <Text style={styles.apptLabel}>{t.attachments}</Text>
        </View>

        <View style={styles.chatbotRow}>
          <TouchableOpacity
            style={[styles.apptButton, styles.chatbotBtnRow, attachments.length >= 3 && { backgroundColor: "#ccc" }]}
            onPress={pickMedia}
            disabled={attachments.length >= 3}
          >
            <Feather name="paperclip" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.apptButtonText}>{t.addFile}</Text>
          </TouchableOpacity>
          <Text style={styles.chatbotInfoText}>{attachments.length} / 3</Text>
        </View>

        <FlatList
          data={attachments}
          horizontal
          keyExtractor={(item, index) => item.uri + index}
          renderItem={({ item, index }) => (
            <View style={styles.attachmentWrap}>
              {item.type === "image" ? (
                <Image source={{ uri: item.uri }} style={styles.chatbotMediaThumb} />
              ) : (
                <View style={[styles.chatbotMediaThumb, styles.chatbotVideoThumb, { justifyContent: "center", alignItems: "center", backgroundColor: "#333" }]}>
                  <Feather name="video" size={20} color="#fff" />
                </View>
              )}
              <TouchableOpacity onPress={() => setAttachments((prev) => prev.filter((_, idx) => idx !== index))} style={styles.chatbotMediaRemove}>
                <Feather name="trash-2" size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>



      {/* Submit Button */}
      <TouchableOpacity style={[styles.apptButton, styles.chatbotSendBtn]} onPress={handleSubmit}>
        <Feather name="send" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.apptButtonText}>{t.submit}</Text>
      </TouchableOpacity>
    </View>
  );
}
