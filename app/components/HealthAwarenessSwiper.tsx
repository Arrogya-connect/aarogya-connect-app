// app/components/HealthAwarenessSwiper.tsx
import React from "react";
import { View, Text, TouchableOpacity, Alert, Linking, Platform } from "react-native";
import Swiper from "react-native-swiper";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../../styles/dashboardStyles";
import { Feather } from "@expo/vector-icons";
import { HEALTH_AWARENESS_SLIDES } from "../constants/HealthAwarenessSwiper";
import { Lang } from "../constants/HealthAwarenessSwiper";




export type AwarenessSlide = {
  title: string;
  bullets: string[];
  info: string;
  icon?: string;
  cta?: string;
};



type Props = {
  lang: Lang;
  onCTAPress?: (slide: AwarenessSlide) => void;
};

export default function HealthAwarenessSwiper({ lang, onCTAPress }: Props) {
  const slides = HEALTH_AWARENESS_SLIDES[lang];

  // Try to open native maps with query. Fallback to Google Maps web link
  const openMaps = async (query: string) => {
    try {
      const encoded = encodeURIComponent(query);
      // geo: works on many devices, but may not on web / some Android variants
      const geoUrl = Platform.select({
        ios: `maps:0,0?q=${encoded}`,
        android: `geo:0,0?q=${encoded}`,
        default: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      });

      if (geoUrl) {
        const supported = await Linking.canOpenURL(geoUrl);
        if (supported) {
          await Linking.openURL(geoUrl);
          return;
        }
      }
      // fallback to google maps web search
      const web = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
      await Linking.openURL(web);
    } catch (err) {
      console.error("openMaps err:", err);
      Alert.alert("Error", "Maps खोलने में समस्या हुई। कृपया मैन्युअल रूप से सर्च करें।");
    }
  };

  // Open a google search for keywords (useful for tips pages)
  const openSearch = async (query: string) => {
    try {
      const encoded = encodeURIComponent(query);
      const url = `https://www.google.com/search?q=${encoded}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "ब्राउज़र खोलने में समस्या हुई।");
      }
    } catch (err) {
      console.error("openSearch err:", err);
      Alert.alert("Error", "सर्च खोलने में समस्या हुई।");
    }
  };

  // Handler called when CTA pressed
const handleCTA = (s: AwarenessSlide) => {

    // If parent wants to override CTA behavior, call it
    if (onCTAPress) {
      onCTAPress(s);
      return;
    }

    const text = s.cta ?? s.title ?? "";
    // If the CTA suggests finding hospitals, open maps
    if (/अस्पताल|नज़दीकी|निकट|hospital|clinic/i.test(text)) {
      // prefer searching for government hospital near me
      const query = "government hospital near me";
      openMaps(query);
      return;
    }

    // Otherwise open google search for the CTA text (tips/helpful articles)
    openSearch(text);
  };

  return (
    <Swiper
      style={styles.swiper}
      showsPagination
      autoplay
      autoplayTimeout={5}
      dotStyle={styles.swiperDot}
      activeDotStyle={styles.swiperActiveDot}
      showsButtons
      nextButton={<Text style={styles.swiperButton}>›</Text>}
      prevButton={<Text style={styles.swiperButton}>‹</Text>}
      buttonWrapperStyle={styles.swiperButtonWrapper}
      paginationStyle={{ bottom: -12 }}
    >
      {slides.map((s, i) => (
        <View key={i} style={styles.awarenessCardModernWrap}>
          <LinearGradient
            colors={["#FFFFFF", "#F7FBFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.awarenessCardModern}
          >
            <View style={styles.awarenessTopRow}>
              <View style={styles.awarenessIconBadge}>
                <Text style={styles.awarenessIconText}>{s.icon ?? "ℹ️"}</Text>
              </View>
              <Text style={styles.awarenessTitleModern}>{s.title}</Text>
            </View>

            <View style={styles.bulletListModern}>
              {s.bullets.map((b, idx) => (
                <View key={idx} style={styles.bulletRowModern}>
                  <View style={styles.bulletDotModern} />
                  <Text style={styles.bulletTextModern}>{b}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.infoLineModern}>{s.info}</Text>

            {s.cta ? (
              <TouchableOpacity
                style={styles.awarenessBtnModern}
                activeOpacity={0.9}
                onPress={() => handleCTA(s)}
              >
                <Feather name="map-pin" size={14} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.awarenessBtnTextModern}>{s.cta}</Text>
              </TouchableOpacity>
            ) : null}
          </LinearGradient>
        </View>
      ))}
    </Swiper>
  );
}
