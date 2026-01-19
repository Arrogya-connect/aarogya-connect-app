import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE } from "./constants/api";
import { SyncManager } from "./services/SyncManager";

// Simple Global State for Simulation
export let IS_OFFLINE_SIMULATED = false;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  /* ===== FOOTER STATE ===== */
  const [activeTab, setActiveTab] = useState<"home" | "records" | "profile">(
    "profile"
  );

  // Simulation State
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(IS_OFFLINE_SIMULATED);

  const toggleSimulation = (val: boolean) => {
    IS_OFFLINE_SIMULATED = val;
    setIsSimulatedOffline(val);
    Alert.alert(
      val ? "🛑 Offline Mode ON" : "🟢 Online Mode ON",
      val
        ? "The app will now pretend to have no internet. Submissions will go to the Outbox."
        : "App is back online. Sync will trigger shortly."
    );

    if (!val) {
      SyncManager.forceSync();
    }
  };


  /* ===== LANGUAGE STATE ===== */
  const [language, setLanguage] = useState<
    "English" | "Hindi" | "Punjabi"
  >("English");
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const token = await AsyncStorage.getItem("sessionToken");
        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: { "x-session-token": token || "" },
        });
        const json = await res.json();
        if (res.ok && json.ok && mounted) {
          // server returns user object in json.user
          setUser(json.user);
        } else {
          console.warn("profile fetch failed", json);
        }
      } catch (err) {
        console.warn("profile fetch error", err);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, []);

  const [user, setUser] = useState<any>({
    name: "Loading...",
    username: "",
    phone: "",
    email: "",
    avatar: require("../assets/images/4.png"),
  });

  /* ===== HANDLERS ===== */

  const handleChangeDP = () => {
    Alert.alert("Change Profile Photo", "Choose option", [
      { text: "Camera" },
      { text: "Gallery" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLanguageChange = () => {
    Alert.alert("Select Language", "", [
      { text: "English", onPress: () => setLanguage("English") },
      { text: "हिंदी", onPress: () => setLanguage("Hindi") },
      { text: "ਪੰਜਾਬੀ", onPress: () => setLanguage("Punjabi") },
      { text: "Cancel", style: "cancel" },
    ]);
  };
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("sessionToken");
      if (token) {
        // Attempt server-side logout (best-effort)
        try {
          await fetch(`${API_BASE}/api/auth/logout`, {
            method: "DELETE",
            headers: { "x-session-token": token },
          });
        } catch (e) {
          console.warn("logout request failed", e);
        }
      }

      // Clear local storage
      await AsyncStorage.removeItem("sessionToken");
      await AsyncStorage.removeItem("user");

      // Navigate to login screen
      router.replace("/");
    } catch (err) {
      console.error("handleLogout error", err);
      // Ensure we still remove token locally
      await AsyncStorage.removeItem("sessionToken");
      router.replace("/");
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#F6F7FB"]} style={{ flex: 1 }}>
      {/* 🔑 SAME SAFE AREA HANDLING AS DASHBOARD */}
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 80, // space so content doesn’t hide behind footer
          }}
        >
          {/* ===== PROFILE HEADER ===== */}
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={handleChangeDP}>
              <Image source={user.avatar} style={styles.avatar} />
              <View style={styles.cameraBadge}>
                <Feather name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.name}>{user.name}</Text>
          </View>

          {/* ===== PERSONAL INFO ===== */}
          <SectionTitle title="Personal Information" />

          <Card>
            <EditableRow
              icon="user"
              label="Username"
              value={user.username}
              onPress={() =>
                router.push({
                  pathname: "/profile-edit-field",
                  params: { field: "username", value: user.username },
                })
              }
            />

            <EditableRow
              icon="phone"
              label="Phone"
              value={user.phone}
              onPress={() =>
                router.push({
                  pathname: "/profile-edit-field",
                  params: { field: "phone", value: user.phone },
                })
              }
            />

            <EditableRow
              icon="mail"
              label="Email"
              value={user.email}
              onPress={() =>
                router.push({
                  pathname: "/profile-edit-field",
                  params: { field: "email", value: user.email },
                })
              }
            />

            <EditableRow
              icon="globe"
              label="Language"
              value={language}
              onPress={handleLanguageChange}
            />
          </Card>

          {/* ===== APP & SUPPORT ===== */}
          <SectionTitle title="App & Support" />

          <Card>
            <ActionRow
              icon="file-text"
              label="My Records"
              onPress={() => router.push("/records")}
            />

            <ActionRow
              icon="help-circle"
              label="Help & Support"
              onPress={() => router.push("/help-support")}
            />

            <ActionRow
              icon="log-out"
              label="Logout"
              danger
              onPress={handleLogout}
            />
          </Card>

          {/* DEVELOPER TOOLS (Safe Testing) */}
          <View style={{ marginTop: 10, paddingHorizontal: 16, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }}>
              <View>
                <Text style={{ fontWeight: '600', color: '#374151', fontSize: 13 }}>Simulate Offline Mode</Text>
                <Text style={{ fontSize: 11, color: '#6B7280' }}>Force app to use "Outbox"</Text>
              </View>
              <Switch
                value={isSimulatedOffline}
                onValueChange={toggleSimulation}
                trackColor={{ false: "#767577", true: "#EF4444" }}
                thumbColor={isSimulatedOffline ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* ===== DISCLAIMER ===== */}
          <View style={styles.disclaimerWrapper}>
            <View style={styles.disclaimerBox}>
              <Feather name="info" size={18} color="#2563EB" />
              <Text style={styles.disclaimerText}>
                Aarogya Connect provides general health information only. It does
                not replace professional medical advice. Always consult a
                qualified doctor for diagnosis and treatment.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* ===== FOOTER (100% MATCHES DASHBOARD) ===== */}
        <View style={styles.bottomBar}>
          {/* HOME */}
          <TouchableOpacity
            style={styles.bottomItem}
            onPress={() => {
              setActiveTab("home");
              router.replace("/dashboard");
            }}
          >
            {activeTab === "home" && <View style={styles.bottomActiveLine} />}
            <Text
              style={
                activeTab === "home"
                  ? styles.bottomItemTextActive
                  : styles.bottomItemText
              }
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* RECORDS */}
          <TouchableOpacity
            style={styles.bottomItem}
            onPress={() => {
              setActiveTab("records");
              router.push("/records");
            }}
          >
            {activeTab === "records" && (
              <View style={styles.bottomActiveLine} />
            )}
            <Text
              style={
                activeTab === "records"
                  ? styles.bottomItemTextActive
                  : styles.bottomItemText
              }
            >
              Records
            </Text>
          </TouchableOpacity>

          {/* PROFILE */}
          <TouchableOpacity style={styles.bottomItem}>
            <View style={styles.bottomActiveLine} />
            <Text style={styles.bottomItemTextActive}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

/* ================= COMPONENTS ================= */

const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionWrapper}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.cardWrapper}>
    <BlurView intensity={20} style={styles.card}>
      {children}
    </BlurView>
  </View>
);

const EditableRow = ({ icon, label, value, onPress }: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Feather name={icon} size={18} color="#2563EB" />
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
    <Feather name="chevron-right" size={16} color="#9CA3AF" />
  </TouchableOpacity>
);

const ActionRow = ({ icon, label, onPress, danger }: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Feather
      name={icon}
      size={18}
      color={danger ? "#DC2626" : "#2563EB"}
    />
    <Text style={[styles.rowLabel, danger && { color: "#DC2626" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  profileHeader: { alignItems: "center", marginBottom: 22 },

  avatar: { width: 92, height: 92, borderRadius: 999 },

  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563EB",
    borderRadius: 999,
    padding: 6,
  },

  name: { fontSize: 20, fontWeight: "700", marginTop: 12 },

  sectionWrapper: { paddingHorizontal: 16, marginBottom: 8 },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  cardWrapper: { paddingHorizontal: 16, marginBottom: 22 },

  card: {
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },

  rowLabel: { flex: 1, fontSize: 14, fontWeight: "600" },

  rowValue: { fontSize: 13, color: "#6B7280" },

  disclaimerWrapper: { paddingHorizontal: 16, marginBottom: 16 },

  disclaimerBox: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#1E3A8A",
    lineHeight: 18,
  },

  /* ===== FOOTER (MATCH DASHBOARD) ===== */
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  bottomItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomItemText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  bottomItemTextActive: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  bottomActiveLine: {
    width: "40%",
    height: 2.3,
    backgroundColor: "#F97316",
    borderRadius: 999,
    marginBottom: 6,
  },
});
