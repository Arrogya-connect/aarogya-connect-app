// app/components/HeroSection.tsx
import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import { styles } from "../../styles/dashboardStyles";

type Props = {
    lang: "en" | "hi" | "pa";
};

export const STRINGS = {
    en: {
        heroTitle: "AarogyaConnect",
        heroSubtitle: "A Punjab Government–Sponsored Initiative",
        heroLine: "Free digital health support for every family.",
        healthAwareness: "Health Awareness",
    },

    hi: {
        heroTitle: "आरोग्यकनेक्ट",
        heroSubtitle: "पंजाब सरकार द्वारा प्रायोजित पहल",
        heroLine: "मुफ्त डिजिटल हेल्थ सहायता, हर परिवार के लिए।",
        healthAwareness: "स्वास्थ्य जागरूकता",
    },

    pa: {
        heroTitle: "ਆਰੋਗਿਆਕਨੈਕਟ",
        heroSubtitle: "ਪੰਜਾਬ ਸਰਕਾਰ ਵੱਲੋਂ ਪ੍ਰਾਯੋਜਿਤ ਪਹਿਲ",
        heroLine: "ਹਰ ਪਰਿਵਾਰ ਲਈ ਮੁਫ਼ਤ ਡਿਜ਼ੀਟਲ ਸਿਹਤ ਸਹਾਇਤਾ।",
        healthAwareness: "ਸਿਹਤ ਜਾਗਰੂਕਤਾ",
    },
};


export default function HeroSection({ lang }: Props) {
    return (
        <BlurView intensity={55} tint="light" style={styles.heroCard}>
            <LinearGradient
                colors={["#EEF2FF", "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
            >
                <View style={styles.heroHeader}>
                    <Text style={styles.heroTitle}>
                        {STRINGS[lang].heroTitle}
                    </Text>

                    <Text style={styles.heroSubtitle}>
                        {STRINGS[lang].heroSubtitle}
                    </Text>

                    <Text style={styles.heroLine}>
                        {STRINGS[lang].heroLine}
                    </Text>
                </View>

                <View style={styles.heroContentRow}>
                    <View style={styles.heroBadgesCol}>
                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeIcon}>✅</Text>
                            <Text style={styles.heroBadgeText}>
                                {lang === "en"
                                    ? "Free of Cost"
                                    : lang === "hi"
                                        ? "निःशुल्क सेवा"
                                        : "ਮੁਫ਼ਤ ਸੇਵਾ"}
                            </Text>
                        </View>

                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeIcon}>🏥</Text>
                            <Text style={styles.heroBadgeText}>
                                {lang === "en"
                                    ? "Govt. Verified"
                                    : lang === "hi"
                                        ? "सरकारी सत्यापित"
                                        : "ਸਰਕਾਰੀ ਤਸਦੀਕ"}
                            </Text>
                        </View>

                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeIcon}>🌐</Text>
                            <Text style={styles.heroBadgeText}>
                                {lang === "en"
                                    ? "Local Languages"
                                    : lang === "hi"
                                        ? "स्थानीय भाषाएँ"
                                        : "ਸਥਾਨਕ ਭਾਸ਼ਾਵਾਂ"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.heroLottieWrapper}>
                        <View style={styles.heroLottieContainer}>
                            <LottieView
                                source={require("../../assets/animations/doctor-animation.json")}
                                autoPlay
                                loop
                                style={styles.heroLottie}
                            />
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </BlurView>
    );
}
