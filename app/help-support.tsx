import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={["#FFFFFF", "#F6F7FB"]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* ================= HEADER ================= */}
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>
          Aarogya Connect – Your trusted digital health companion
        </Text>

        {/* ================= WHY CHOOSE US ================= */}
        <Card>
          <SectionHeader icon="heart" title="Why Choose Aarogya Connect?" />
          <Bullet text="Reliable and trusted health information aligned with Indian healthcare needs" />
          <Bullet text="Offline-first and low-data friendly for accessibility everywhere" />
          <Bullet text="Privacy-first design with secure data handling" />
          <Bullet text="Quick access to personal health records anytime, anywhere" />
        </Card>

        {/* ================= WHAT MAKES US DIFFERENT ================= */}
        <Card>
          <SectionHeader icon="shield" title="What Makes Us Different?" />
          <Bullet text="Strong focus on preventive healthcare, not just treatment" />
          <Bullet text="Clean, simple UI designed for all age groups" />
          <Bullet text="No advertisements or unnecessary distractions" />
          <Bullet text="Built with a public-service and citizen-first mindset" />
        </Card>

        {/* ================= SUPPORT ================= */}
        <Card>
          <SectionHeader icon="headphones" title="Support & Contact" />
          <InfoRow icon="mail" text="support@aarogyaconnect.in" />
          <InfoRow icon="phone" text="1800-XXX-XXXX" />
          <InfoRow icon="clock" text="Support Hours: 9:00 AM – 6:00 PM" />
        </Card>

        {/* ================= DISCLAIMER ================= */}
        <Card subtle>
          <SectionHeader icon="info" title="Medical Disclaimer" />
          <Text style={styles.disclaimer}>
            Aarogya Connect is an informational and record-management platform.
            It does not replace professional medical consultation. Always seek
            advice from a qualified healthcare provider for diagnosis and treatment.
          </Text>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const Card = ({ children, subtle }: any) => (
  <View
    style={[
      styles.card,
      subtle && { backgroundColor: "#F9FAFB" },
    ]}
  >
    {children}
  </View>
);

const SectionHeader = ({ icon, title }: any) => (
  <View style={styles.sectionHeader}>
    <View style={styles.iconCircle}>
      <Feather name={icon} size={16} color="#2563EB" />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const Bullet = ({ text }: any) => (
  <View style={styles.bulletRow}>
    <View style={styles.dot} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const InfoRow = ({ icon, text }: any) => (
  <View style={styles.infoRow}>
    <Feather name={icon} size={14} color="#2563EB" />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    marginTop: 6,
  },

  bulletText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    color: "#374151",
  },

  disclaimer: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});
