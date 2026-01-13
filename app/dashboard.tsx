// app/dashboard.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  TextInput,
  Platform,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Swiper from "react-native-swiper";
import { styles } from "../styles/dashboardStyles";
import AppointmentForm from "./components/AppointmentForm";
import ChatbotForm from "./components/ChatbotForm";
import HealthAwarenessSwiper from "./components/HealthAwarenessSwiper";
import TrustGallery from "./components/TrustGallery";
import ChatbotWidget from "./components/ChatbotWidget";
import { router } from "expo-router";
import { COMMON_HEALTH_ISSUES } from "./components/common-health-issues";
import { HOW_TO_USE_STEPS, STRINGS } from "./components/common-health-issues";
import HeroSection from "./components/HeroSection";




type HealthIssueProps = {
  title: string;
  desc: string;
  emoji: string;
  color: string;
  tips: string;
};

type StepProps = {
  step: string;
  title: string;
  desc: string;
};

type Lang = "en" | "hi" | "pa";




const getInitials = (name: string) => {
  if (!name) return "U";

  const clean = name.split("@")[0].trim();
  const parts = clean.split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
};


export const LOCAL_STRINGS = {
  en: {
    chatbotFormTitle: "Chatbot Query Response Form",
  },
  hi: {
    chatbotFormTitle: "चैटबॉट क्वेरी प्रतिक्रिया फ़ॉर्म",
  },
  pa: {
    chatbotFormTitle: "ਚੈਟਬੋਟ ਪ੍ਰਸ਼ਨ ਜਵਾਬ ਫਾਰਮ",
  },
};


export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  const [lang, setLang] = useState<Lang>("en");
  const [langOpen, setLangOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("home");

  const username = "Arman Malik";

  return (
    <LinearGradient
      colors={["#F3F4F6", "#EFF6FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../assets/images/app-logo.png")}
              style={styles.appLogo}
              resizeMode="contain"
            />
            <Image
              source={require("../assets/images/partner-logo.png")}
              style={styles.partnerLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.langButton}
              activeOpacity={0.85}
              onPress={() => setLangOpen(true)}
            >
              <Text style={styles.langText}>
                {lang === "en" ? "EN" : lang === "hi" ? "HI" : "PA"} ▼
              </Text>
            </TouchableOpacity>


            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/profile-screen")}
            >
              <View style={styles.profileCircle}>
                <Text style={styles.profileInitial}>
                  {getInitials(username)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerUnderline} />

        {/* modal for language selection */}
        <Modal visible={langOpen} transparent animationType="fade">
          <View style={styles.langCenterOverlay}>
            <View style={styles.langCenterModal}>
              <Text style={styles.langTitle}>Select Language</Text>

              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी" },
                { code: "pa", label: "ਪੰਜਾਬੀ" },
              ].map(item => (
                <TouchableOpacity
                  key={item.code}
                  style={styles.langCenterOption}
                  onPress={() => {
                    setLang(item.code as Lang);
                    setLangOpen(false);
                  }}
                >
                  <Text style={styles.langCenterText}>{item.label}</Text>
                  {lang === item.code && (
                    <Feather name="check-circle" size={18} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.langCancelBtn}
                onPress={() => setLangOpen(false)}
              >
                <Text style={styles.langCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>




        {/* ---------- MAIN CONTENT ---------- */}
        <ScrollView contentContainerStyle={styles.scrollContent}>


          {/* ===== HERO ===== */}
          <HeroSection lang={lang} />



          {/* ===== COMMON HEALTH ISSUES ===== */}



          <Text style={styles.sectionTitle}>
            {lang === "en"
              ? "Common Health Issues"
              : lang === "hi"
                ? "सामान्य स्वास्थ्य समस्याएँ"
                : "ਆਮ ਸਿਹਤ ਸਮੱਸਿਆਵਾਂ"}
          </Text>
          <View style={styles.issueGrid}>
            {COMMON_HEALTH_ISSUES[lang].map((item, index) => (
              <HealthIssueCard
                key={index}
                title={item.title}
                desc={item.desc}
                emoji={item.emoji}
                color={item.color}
                tips={item.tips}
              />
            ))}
          </View>




          {/* ===== HOW TO USE ===== */}
          <Text style={styles.sectionTitle}>
            {lang === "en"
              ? "How to Use AarogyaConnect"
              : lang === "hi"
                ? "आरोग्यकनेक्ट का उपयोग कैसे करें"
                : "ਆਰੋਗਿਆਕਨੈਕਟ ਕਿਵੇਂ ਵਰਤਣਾ ਹੈ"}
          </Text>

          <View style={styles.stepsList}>
            {HOW_TO_USE_STEPS[lang].map(item => (
              <StepCard
                key={item.step}
                step={item.step}
                title={item.title}
                desc={item.desc}
              />
            ))}
          </View>

          {/* ===== HEALTH AWARENESS SWIPER ===== */}



          <Text style={styles.sectionTitle}>
            {STRINGS[lang].healthAwareness}
          </Text>

          <View style={{ marginTop: 12 }}>
            <HealthAwarenessSwiper lang={lang} />
          </View>


          {/* ===== APPOINTMENT FORM ===== */}

          <Text style={styles.sectionTitle}>Book Appointment</Text>
          <View style={{ marginTop: 12 }}>
            <AppointmentForm lang={lang} />

          </View>

          {/* ===== CHATBOT FORM ===== */}

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
            {LOCAL_STRINGS[lang].chatbotFormTitle}
          </Text>
          <View style={{ marginTop: 12 }}>
            <ChatbotForm lang={lang} />
          </View>

          <View style={{ height: 40 }} />

          {/* ===== TRUST GALLERY ===== */}
          <View style={{ marginTop: 12 }}>
            <TrustGallery />
          </View>

        </ScrollView>


        {/* ===== CHATBOT WIDGET ===== */}
        <ChatbotWidget />


        {/* ---------- FOOTER NAV ---------- */}
        <View style={styles.bottomBar}>

          {/* HOME TAB */}
          <TouchableOpacity
            style={styles.bottomItem}
            onPress={() => setActiveTab("home")}
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

          {/* RECORDS TAB */}
          <TouchableOpacity
            style={styles.bottomItem}
            onPress={() => {
              setActiveTab("records");
              router.push("/records");
            }}
          >
            {activeTab === "records" && <View style={styles.bottomActiveLine} />}
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

          {/* PROFILE TAB */}
          <TouchableOpacity
            style={styles.bottomItem}
            onPress={() => {
              setActiveTab("profile");
              router.push("/profile-screen");
            }}
          >
            {activeTab === "profile" && <View style={styles.bottomActiveLine} />}
            <Text
              style={
                activeTab === "profile"
                  ? styles.bottomItemTextActive
                  : styles.bottomItemText
              }
            >
              Profile
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </LinearGradient>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const HealthIssueCard = ({
  title,
  desc,
  emoji,
  color,
  tips,
}: HealthIssueProps) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const flipAnim = React.useRef(new Animated.Value(0)).current;

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const handlePress = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      duration: 280,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.issueCard}
    >
      <Animated.View
        style={[
          styles.issueSide,
          {
            transform: [
              { perspective: 1000 },
              { rotateY: frontInterpolate },
            ],
          },
        ]}
      >
        <View style={styles.issueEmojiCircle}>
          <Text style={styles.issueEmoji}>{emoji}</Text>
        </View>
        <Text style={[styles.issueTitle, { color }]}>{title}</Text>
        <Text style={styles.issueDesc}>{desc}</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.issueSide,
          styles.issueBack,
          {
            transform: [
              { perspective: 1000 },
              { rotateY: backInterpolate },
            ],
          },
        ]}
      >
        <Text style={[styles.issueTitle, { color }]}>{title} – उपाय</Text>
        <Text style={styles.issueTips}>{tips}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const StepCard = ({ step, title, desc }: StepProps) => (
  <View style={styles.stepCard}>
    <View style={styles.stepCircle}>
      <Text style={styles.stepNumber}>{step}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </View>
  </View>
);