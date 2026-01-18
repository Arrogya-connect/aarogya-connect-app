import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    StyleSheet,
    Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import {
    chatbotReply,
    resetChatbot,
} from "./chatbot/logic"; // ✅ LOGIC SYNCED

const { height } = Dimensions.get("window");

type Message = {
    id: string;
    from: "bot" | "user";
    text: string;
    severity?: "BASIC" | "MEDIUM" | "EMERGENCY";
    options?: { label: string; value: any }[];
};

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const flatListRef = useRef<FlatList>(null);

    /* ---------------- AUTO SCROLL ---------------- */
    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    /* ---------------- OPEN / CLOSE CHAT ---------------- */
    const toggleChat = () => {
        if (!open) {
            setOpen(true);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setOpen(false);
                setMessages([]);
            });
        }
    };

    /* ---------------- INTRO (ONLY ON OPEN) ---------------- */
    useEffect(() => {
        if (open && messages.length === 0) {
            resetChatbot(); // 🔁 full reset
            const intro = chatbotReply("");
            setMessages([
                {
                    id: Date.now().toString(),
                    from: "bot",
                    text: intro.text,
                    options: intro.options,
                },
            ]);
        }
    }, [open]);

    /* ---------------- SEND MESSAGE ---------------- */
    const sendMessage = (textInvoked?: string) => {
        const textToSend = typeof textInvoked === "string" ? textInvoked : input;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            from: "user",
            text: textToSend,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setTyping(true);

        setTimeout(() => {
            const reply = chatbotReply(userMsg.text);

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                from: "bot",
                text: reply.text,
                severity: reply.severity,
                options: reply.options,
            };

            setMessages((prev) => [...prev, botMsg]);
            setTyping(false);
        }, 700);
    };

    /* ---------------- RESET BUTTON ---------------- */
    const resetChat = () => {
        resetChatbot();
        const intro = chatbotReply("");
        setMessages([
            {
                id: Date.now().toString(),
                from: "bot",
                text: intro.text,
                options: intro.options,
            },
        ]);
    };

    /* ---------------- UI ---------------- */
    return (
        <>
            {!open && (
                <TouchableOpacity style={local.floatingBtn} onPress={toggleChat}>
                    <Feather name="message-circle" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            {open && (
                <Animated.View style={[local.overlay, { opacity: fadeAnim }]}>
                    <Animated.View
                        style={[local.chatCard, { transform: [{ scale: scaleAnim }] }]}
                    >
                        {/* HEADER */}
                        <View style={local.header}>
                            <Text style={local.headerTitle}>🩺 Aarogya Assistant</Text>

                            <View style={{ flexDirection: "row" }}>
                                <TouchableOpacity onPress={resetChat} style={{ marginRight: 16 }}>
                                    <Feather name="rotate-ccw" size={18} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={toggleChat}>
                                    <Feather name="x" size={22} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* CHAT */}
                        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ padding: 12 }}
                                renderItem={({ item }) => (
                                    <View
                                        style={[
                                            local.msgBubble,
                                            item.from === "user" ? local.userBubble : local.botBubble,
                                            item.severity && local[item.severity as keyof typeof local],
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                local.msgText,
                                                item.from === "user" && { color: "#fff" },
                                            ]}
                                        >
                                            {item.text}
                                        </Text>

                                        {/* RENDER OPTIONS IF AVAILABLE */}
                                        {item.options && (
                                            <View style={local.optionsContainer}>
                                                {item.options.map((opt: { label: string; value: any }, idx: number) => (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={local.optionBtn}
                                                        onPress={() => sendMessage(String(opt.value))}
                                                    >
                                                        <Text style={local.optionText}>{opt.label}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                )}
                            />

                            {typing && (
                                <Text style={local.typing}>Aarogya Assistant is typing…</Text>
                            )}

                            {/* INPUT */}
                            <View style={local.inputRow}>
                                <TextInput
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder="Type message…"
                                    style={local.input}
                                />
                                <TouchableOpacity style={local.sendBtn} onPress={() => sendMessage()}>
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

/* ---------------- STYLES ---------------- */
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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

    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },

    msgBubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 14,
        marginVertical: 6,
    },

    botBubble: {
        backgroundColor: "#EFF3FF",
        alignSelf: "flex-start",
    },

    userBubble: {
        backgroundColor: "#2563EB",
        alignSelf: "flex-end",
    },

    BASIC: {
        borderLeftWidth: 4,
        borderLeftColor: "#22C55E",
    },

    MEDIUM: {
        borderLeftWidth: 4,
        borderLeftColor: "#FACC15",
    },

    EMERGENCY: {
        borderLeftWidth: 4,
        borderLeftColor: "#DC2626",
    },

    msgText: {
        fontSize: 14,
        lineHeight: 18,
    },

    // ✅ ADDED STYLES FOR OPTIONS
    optionsContainer: {
        marginTop: 10,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },

    optionBtn: {
        backgroundColor: "#ffffff",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#2563EB",
        marginBottom: 6,
    },

    optionText: {
        color: "#2563EB",
        fontSize: 13,
        fontWeight: "600",
    },

    typing: {
        fontSize: 12,
        color: "#6B7280",
        marginLeft: 12,
        marginBottom: 6,
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

    sendBtn: {
        marginLeft: 8,
        backgroundColor: "#2563EB",
        padding: 12,
        borderRadius: 12,
    },
});
