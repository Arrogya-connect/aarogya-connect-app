import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo } from "@react-native-community/netinfo"; // Added
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { JSX, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { styles } from "../../styles/dashboardStyles";
import { API_BASE } from "../constants/api";
import { CHATBOT_TEXT, Lang } from "../constants/chatbotText";
import { IS_OFFLINE_SIMULATED } from "../profile-screen";
import { OfflineQueue } from "../services/OfflineQueue";

type MediaItem = { uri: string; type: "image" | "video"; name?: string };

export default function ChatbotForm({ lang }: { lang: Lang }): JSX.Element {
  const t = CHATBOT_TEXT[lang];
  const netInfo = useNetInfo(); // NetInfo Hook

  // ---------- Form State ----------
  const [queryNumber, setQueryNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [attachments, setAttachments] = useState<MediaItem[]>([]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);

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
      // Force copy to cache to ensure we have a valid file:// path that fetch can read
      const filename = uri.split("/").pop() || `file-${Date.now()}`;
      const dest = `${(FileSystem as any).cacheDirectory}${Date.now()}-${filename}`;
      await FileSystem.copyAsync({ from: uri, to: dest });

      // ENSURE protocol exists
      let finalUri = dest;
      if (!finalUri.startsWith("file://")) {
        finalUri = "file://" + finalUri;
      }
      return finalUri;
    } catch (e) {
      console.warn("normalizeUriForUpload failed", e, uri);
      // Fallback: return original URI, ensure protocol
      let fallback = uri;
      if (!fallback.startsWith("file://") && !fallback.startsWith("content://")) {
        fallback = "file://" + fallback;
      }
      return fallback;
    }
  }

  // ---------- Submit & Backend Integration ----------
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("sessionToken");
      if (!token) {
        Alert.alert("Not logged in", "Please login.");
        setLoading(false);
        return;
      }

      // --- OFFLINE CHECK ---
      const isReallyOffline = netInfo.isConnected === false;
      if (isReallyOffline || IS_OFFLINE_SIMULATED) {
        // Prepare Attachments for Queue (keep local URIs)
        const curatedAttachments = [];
        for (const item of attachments) {
          let uri = item.uri;
          if (!uri.startsWith("file://") && !uri.startsWith("content://")) {
            uri = await normalizeUriForUpload(uri) || uri;
          }
          curatedAttachments.push({ ...item, uri });
        }

        const payload = {
          queryNumber,
          phone: sanitizeDigits(phone),
          summary,
          attachments: curatedAttachments // Store LOCAL URIs
        };

        await OfflineQueue.addToQueue('RECORD', payload); // Type 'RECORD'

        Alert.alert("Saved to Outbox 📡", "No internet. Your query and media have been saved locally. They will upload automatically when online.");

        // Cleanup
        setQueryNumber("");
        setPhone("");
        setSummary("");
        setAttachments([]);
        setErrors({});
        setLoading(false);
        return;
      }

      // --- ONLINE FLOW BELOW ---

      // 1. Get Upload Signature
      const sigRes = await fetch(`${API_BASE}/api/media/signature`, {
        headers: { "x-session-token": token },
      });
      const sigData = await sigRes.json();
      if (!sigRes.ok || !sigData.ok) {
        Alert.alert("Error", "Failed to start upload session.");
        setLoading(false);
        return;
      }
      const { signature, timestamp, cloudName, apiKey, folder } = sigData;

      // 2. Upload Files to Cloudinary
      const uploadedAttachments: { uri: string; type: string; name: string }[] = [];

      for (let i = 0; i < attachments.length; i++) {
        const item = attachments[i];

        // Ensure uri is ready
        let uriToUpload = item.uri;
        if (!uriToUpload.startsWith("file://")) {
          uriToUpload = await normalizeUriForUpload(item.uri) || item.uri;
        }

        const data = new FormData();
        data.append("file", {
          uri: uriToUpload,
          type: item.type === 'video' ? 'video/mp4' : 'image/jpeg',
          name: item.name || `file${i}`
        } as any);
        data.append("api_key", apiKey);
        data.append("timestamp", timestamp.toString());
        data.append("signature", signature);
        if (folder) data.append("folder", folder);

        // Upload Endpoint based on type
        const resourceType = item.type === "video" ? "video" : "image";
        const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

        console.log(`Uploading ${i + 1}/${attachments.length} to Cloudinary...`);
        const uploadRes = await fetch(cloudUrl, {
          method: "POST",
          body: data,
        });
        const uploadJson = await uploadRes.json();

        if (uploadJson.secure_url) {
          uploadedAttachments.push({
            uri: uploadJson.secure_url, // Store the CLOUD URL
            type: resourceType,
            name: item.name || "upload"
          });
        } else {
          console.error("Cloudinary error:", uploadJson);
          Alert.alert("Upload Failed", `Could not upload file ${i + 1}`);
          setLoading(false);
          return;
        }
      }

      // 3. Submit Record to Backend (JSON now, not FormData)
      console.log("Submitting record with URLs:", uploadedAttachments);

      const payload = {
        queryNumber,
        phone,
        summary,
        attachments: uploadedAttachments // Sending URLs!
      };

      const res = await fetch(`${API_BASE}/api/records`, {
        method: "POST",
        headers: {
          "x-session-token": token,
          "Content-Type": "application/json" // JSON!
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("Record submit response:", res.status, json);

      if (!res.ok || !json.ok) {
        Alert.alert("Error", json.error || "Submission failed");
        setLoading(false);
        return;
      }

      Alert.alert(t.successTitle || "Submitted", "Your query and videos/photos were uploaded successfully!");
      setLoading(false);

      // Cleanup
      setQueryNumber("");
      setPhone("");
      setSummary("");
      setAttachments([]);
      setErrors({});

    } catch (err: any) {
      console.error("chatbot submit error", err);
      Alert.alert("Error", err.message || "Network request failed");
      setLoading(false);
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
        <View style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Feather name="image" size={16} color="#374151" style={{ marginRight: 6 }} />
            <Text style={styles.apptLabel}>{t.attachments}</Text>
          </View>
          <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
            (Photos: Max 10MB • Videos: Max 100MB)
          </Text>
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
      <TouchableOpacity
        style={[styles.apptButton, styles.chatbotSendBtn, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Feather name="send" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.apptButtonText}>{t.submit}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
