/**
 * 🔵 CHATBOT UI — FRONTEND ONLY (NO LOGIC INCLUDED)
 * -------------------------------------------------
 * This component ONLY handles:
 *  - UI rendering
 *  - Animations
 *  - Message display
 *  - Voice button animation
 *  - Multi-language switching (UI only)
 * 
 * 🟡 BACKEND / CHATBOT ENGINE to be plugged in by developer:
 *  1️⃣ Replace dummy "botReplies" with real responses.
 *  2️⃣ Connect sendMessage() → backend model / offline engine.
 *  3️⃣ Insert NLP / intent detection logic.
 *  4️⃣ Voice recording → speech-to-text integration.
 *  5️⃣ Add quick replies or recommended actions.
 * 
 * NOTE: This UI works fully offline, backend must also support offline mode.
 */

import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

type Lang = 'en' | 'hi' | 'pn';

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [lang, setLang] = useState<Lang>("hi");
    const [messages, setMessages] = useState([
        // 🟦 Initial greeting — backend can replace this
        { id: "1", from: "bot", text: "नमस्ते! मैं Aarogya Assistant हूँ 👋" },
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [recording, setRecording] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const flatListRef = useRef<FlatList>(null);

    /* --------------------------------------------------------------------------
       AUTO-SCROLL — runs every time a new message is added
       (No logic needed here, backend dev does not need to touch this)
    --------------------------------------------------------------------------- */
    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, typing]);

    /* --------------------------------------------------------------------------
       SOUND EFFECTS (OPTIONAL)
       Backend dev: can enable when sound files are available
    --------------------------------------------------------------------------- */
    const playSendSound = async () => { };
    const playReceiveSound = async () => { };

    /* --------------------------------------------------------------------------
       MIC BUTTON — only UI animation
       Backend developer must add:
       - Actual voice recording
       - Speech-to-text engine (offline)
       - Pass final transcript into chatbot logic
    --------------------------------------------------------------------------- */
    const startMicPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 400, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ])
        ).start();
    };

    const stopMicPulse = () => {
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
    };

    const toggleRecording = () => {
        if (!recording) {
            setRecording(true);
            startMicPulse();

            /**
             * 🟡 BACKEND DEVELOPER:
             * Start voice recording here.
             * 
             * After recording:
             *   1. Convert to text
             *   2. Set input to transcript → setInput(transcript)
             *   3. Call sendMessage()
             */
        } else {
            setRecording(false);
            stopMicPulse();

            // TEMPORARY — backend will replace
            setInput("(Voice recorded — offline mode)");
        }
    };

    /* --------------------------------------------------------------------------
       BACKEND REPLIES (PLACEHOLDER)
       Backend developer must:
       - Replace with actual model output
       - Add condition-based responses
       - Add symptom detection / follow-up questions
    --------------------------------------------------------------------------- */
    const botReplies = {
        en: "I have received your message. Please wait…",
        hi: "मैंने आपकी बात समझ ली है। कृपया थोड़ा इंतजार करें…",
        pn: "ਤੁਹਾਡਾ ਸੁਨੇਹਾ ਮਿਲ ਗਿਆ ਹੈ। ਕੁਝ ਸਮਾਂ ਉਡੀਕ ਕਰੋ…",
    };

    const greetings = {
        en: ["Hello! I am Aarogya Assistant 👋", "How may I help you today?"],
        hi: ["नमस्ते! मैं Aarogya Assistant हूँ 👋", "आप कैसे मदद चाहते हैं?"],
        pn: ["ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ Aarogya Assistant ਹਾਂ 👋", "ਤੁਹਾਨੂੰ ਕਿਸ ਚੀਜ਼ ਦੀ ਜ਼ਰੂਰਤ ਹੈ?"],
    };

    /* --------------------------------------------------------------------------
       UI OPEN/CLOSE — no backend logic needed
    --------------------------------------------------------------------------- */
    const toggleChat = () => {
        if (!open) {
            setOpen(true);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
            ]).start(() => setOpen(false));
        }
    };

    /* --------------------------------------------------------------------------
       SEND MESSAGE — MAIN ENTRY POINT FOR CHATBOT LOGIC
       🟡 Backend developer will integrate their offline engine here:
       Steps for developer:
         1. Take user message → input
         2. Process through NLP model / rule engine
         3. Generate reply
         4. Push reply into messages array
    --------------------------------------------------------------------------- */
    const sendMessage = async () => {
        if (!input.trim()) return;

        // USER MESSAGE (UI only)
        const userMsg = { id: Date.now().toString(), from: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        setTyping(true);
        await playSendSound();

        /**
         * 🟡 BACKEND DEVELOPER:
         * Replace `botReplies[lang]` with:
         *
         * const response = chatbotEngine.process(userMsg.text, lang);
         *
         * where chatbotEngine = offline ML model / rule engine
         */

        setTimeout(async () => {
            const botMsg = {
                id: (Date.now() + 3).toString(),
                from: "bot",
                text: botReplies[lang], // <-- replace this with real logic
            };

            setMessages((prev) => [...prev, botMsg]);
            setTyping(false);
            await playReceiveSound();
        }, 1500);
    };

    /* --------------------------------------------------------------------------
       LANGUAGE SWITCH — ONLY UI
       Backend developer should update response logic to support multi-language
    --------------------------------------------------------------------------- */
    const changeLanguage = () => {
        let next: Lang = lang === "hi" ? "en" : lang === "en" ? "pn" : "hi";
        setLang(next);

        // RESET CHAT WITH NEW LANG
        setMessages([
            { id: Date.now().toString(), from: "bot", text: greetings[next][0] },
            { id: (Date.now() + 1).toString(), from: "bot", text: greetings[next][1] },
        ]);

        /**
         * 🟡 BACKEND DEVELOPER:
         * You must ensure chatbot replies in selected language.
         * Suggested approach:
         *   - Maintain responses in 3 languages
         *   - Model should detect language context
         */
    };

    /* --------------------------------------------------------------------------
       TYPING INDICATOR — UI ONLY
       Backend developer does NOT modify this
    --------------------------------------------------------------------------- */
    const TypingWave = () => {
        const dot1 = useRef(new Animated.Value(0)).current;
        const dot2 = useRef(new Animated.Value(0)).current;
        const dot3 = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const animate = (dot: Animated.Value, delay: number) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(dot, { toValue: -5, duration: 400, useNativeDriver: true, delay }),
                        Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
                    ])
                ).start();
            };

            animate(dot1, 0);
            animate(dot2, 200);
            animate(dot3, 400);
        }, []);

        return (
            <View style={local.waveContainer}>
                <Animated.View style={[local.waveDot, { transform: [{ translateY: dot1 }] }]} />
                <Animated.View style={[local.waveDot, { transform: [{ translateY: dot2 }] }]} />
                <Animated.View style={[local.waveDot, { transform: [{ translateY: dot3 }] }]} />
            </View>
        );
    };

    /* --------------------------------------------------------------------------
       RETURN UI
    --------------------------------------------------------------------------- */
    return (
        <>
            {!open && (
                <TouchableOpacity style={local.floatingBtn} onPress={toggleChat}>
                    <Feather name="message-circle" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            {open && (
                <Animated.View style={[local.overlay, { opacity: fadeAnim }]}>
                    <Animated.View style={[local.chatCard, { transform: [{ scale: scaleAnim }] }]}>

                        {/* HEADER */}
                        <View style={local.header}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={local.avatar}>🩺</Text>
                                <Text style={local.headerTitle}>Aarogya Assistant</Text>
                            </View>

                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <TouchableOpacity onPress={changeLanguage} style={local.langBtn}>
                                    <Text style={{ color: "#2563EB", fontWeight: "700" }}>{lang.toUpperCase()}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={toggleChat} style={{ marginLeft: 10 }}>
                                    <Feather name="x" size={22} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* CHAT AREA */}
                        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View
                                        style={[
                                            local.msgBubble,
                                            item.from === "user" ? local.userBubble : local.botBubble,
                                        ]}
                                    >
                                        <Text style={[local.msgText, item.from === "user" ? { color: "#fff" } : {}]}>
                                            {item.text}
                                        </Text>
                                    </View>
                                )}
                                contentContainerStyle={{ padding: 12 }}
                            />

                            {typing && (
                                <View style={{ marginLeft: 10, marginBottom: 8 }}>
                                    <TypingWave />
                                </View>
                            )}

                            {/* INPUT + MIC */}
                            <View style={local.inputRow}>
                                <TextInput
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder="Type message…"
                                    style={local.input}
                                />

                                {/* MIC BUTTON */}
                                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                    <TouchableOpacity style={local.micBtn} onPress={toggleRecording}>
                                        <Feather name="mic" size={18} color="#fff" />
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* SEND */}
                                <TouchableOpacity style={local.sendBtn} onPress={sendMessage}>
                                    <Feather name="send" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </Animated.View>
            )}
        </>
    );
}

/* --------------------------------------------------------------------------
   STYLES (unchanged)
-------------------------------------------------------------------------- */
const local = StyleSheet.create({
    floatingBtn: {
        position: "absolute",
        bottom: 120,
        right: 20,
        width: 65,
        height: 65,
        backgroundColor: "#2563EB",
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
    },

    overlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
    },

    chatCard: {
        width: "88%",
        height: height * 0.55,
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
    },

    header: {
        backgroundColor: "#2563EB",
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    avatar: { fontSize: 24, marginRight: 6 },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

    langBtn: {
        backgroundColor: "#fff",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
    },

    msgBubble: {
        maxWidth: "75%",
        padding: 10,
        borderRadius: 12,
        marginVertical: 5,
    },

    botBubble: { backgroundColor: "#EFF3FF", alignSelf: "flex-start" },
    userBubble: { backgroundColor: "#2563EB", alignSelf: "flex-end" },

    msgText: { fontSize: 14 },

    waveContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    waveDot: {
        width: 8,
        height: 8,
        backgroundColor: "#2563EB",
        borderRadius: 4,
        marginHorizontal: 3,
    },

    inputRow: {
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#fff",
        alignItems: "center",
    },

    input: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },

    micBtn: {
        marginLeft: 8,
        backgroundColor: "#DC2626",
        padding: 10,
        borderRadius: 12,
    },

    sendBtn: {
        marginLeft: 8,
        backgroundColor: "#2563EB",
        padding: 12,
        borderRadius: 12,
    },
});
