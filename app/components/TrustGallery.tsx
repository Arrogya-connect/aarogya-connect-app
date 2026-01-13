// app/components/TrustGallery.tsx
import React, { useRef, useState, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
    Dimensions,
    StyleSheet,
    Platform,
    Share,
    StatusBar,
    NativeSyntheticEvent,
    NativeScrollEvent,
    ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";



// ... (imports remain same)

// share current slide



// Updated type to accept numbers (require) or strings (urls)
type Slide = {
    uri: string | any;
    type: "image" | "video";
    caption?: string;
};

type MediaItem = {
    uri: string | any | null;
    type: "image" | "video" | "placeholder";
    caption?: string;
    author?: string;
    gallery?: Slide[];
    videoUri?: string | any; // New field for the actual video source
};

type Props = {
    title?: string;
    subtitle?: string;
    items?: MediaItem[];
    limit?: number;
    onOpenGallery?: (item: MediaItem) => void;
};

const { width, height } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = 10;
const PADDING_HORIZONTAL = 16;
const THUMB_SIZE = Math.floor(
    (width - PADDING_HORIZONTAL * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS
);

const TrustVideoSlide = ({ source, style }: { source: any; style: any }) => {
    const player = useVideoPlayer(source, (player) => {
        player.loop = true;
        player.play();
    });

    return (
        <VideoView
            style={style}
            player={player}
            fullscreenOptions={{ isContentCoveringSystemUI: true }}
            allowsPictureInPicture
        />
    );
};

export default function TrustGallery({
    title = "People You Can Trust",
    subtitle = "हम पर भरोसा करें — हमारे पेशेवर साथी",
    items,
    limit = 9,
    onOpenGallery,
}: Props) {

    const insets = useSafeAreaInsets();   // 👈 YAHAN
    const TOOLBAR_HEIGHT = 56;
    const getSource = (uri: any): ImageSourcePropType => {
        if (typeof uri === "string") {
            return { uri: uri };
        }
        return uri; // It's a local require(...)
    };

    // fallback items
    const fallback: MediaItem[] = [
        {
            uri: require("../../assets/images/doctor.png"),
            type: "image",
            caption: "Doctors",
            author: "Govt Clinic",
            gallery: [
                { uri: require("../../assets/images/trust/doctors/6.png"), type: "image", caption: "Dr. Neha" },
                { uri: require("../../assets/images/trust/doctors/5.png"), type: "image", caption: "Dr. Rahul" },
                { uri: require("../../assets/images/trust/doctors/1.png"), type: "image", caption: "Dr. Aanya" },
            ],
        },
        {
            uri: require("../../assets/images/4.png"),
            type: "image",
            caption: "Community Events",
            author: "Primary Care",
            gallery: [
                { uri: require("../../assets/images/trust/events/2.png"), type: "image" },
                { uri: require("../../assets/images/trust/events/3.png"), type: "image" },
                { uri: require("../../assets/images/trust/events/4.png"), type: "image" },
                { uri: require("../../assets/images/trust/events/7.png"), type: "image" },
                { uri: require("../../assets/images/trust/events/8.png"), type: "image" },
                { uri: require("../../assets/images/trust/events/9.png"), type: "image" },
                { uri: require("../../assets/images/trust/events/10.png"), type: "image" },
                { uri: require("../../assets/images/trust/events/11.png"), type: "image" },
                { uri: require("../../assets/images/trust/events/12.png"), type: "image" },
                { uri: require("../../assets/images/trust/events/13.png"), type: "image" },
            ],
        },
        {
            uri: require("../../assets/images/review.png"),
            type: "video",
            caption: "People You Can Trust",
            author: "Local Center",
            gallery: [
                { uri: require("../../assets/images/trust/review/video1.MP4"), type: "video" },
                { uri: require("../../assets/images/trust/review/video2.mp4"), type: "video" },
                { uri: require("../../assets/images/trust/review/video3.mp4"), type: "video" },
            ],
        },

    ];

    const galleryAll = items && items.length > 0 ? items : fallback;

    // show upto `limit` tiles
    const shown = useMemo(() => galleryAll.slice(0, limit), [galleryAll, limit]);

    // pad grid so rows are full
    const padded = useMemo(() => {
        const arr = [...shown];
        while (arr.length % NUM_COLUMNS !== 0) arr.push({ uri: null, type: "placeholder" });
        return arr;
    }, [shown]);

    // modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalSlides, setModalSlides] = useState<Slide[]>([]);
    const [modalIndex, setModalIndex] = useState(0);

    const modalListRef = useRef<FlatList<Slide> | null>(null);

    const openTile = (item: MediaItem, startIndex = 0) => {
        if (item.type === "placeholder") return;

        let slides: Slide[] = [];

        if (item.gallery && item.gallery.length > 0) {
            slides = item.gallery;
        } else if (item.type === "video" && item.videoUri) {
            // Use videoUri if available for video type
            slides = [{ uri: item.videoUri, type: "video", caption: item.caption }];
        } else if (item.uri) {
            // Fallback: use main uri (works for images, or if uri IS the video)
            slides = [{ uri: item.uri, type: item.type === "video" ? "video" : "image", caption: item.caption }];
        }

        if (slides.length === 0) return;
        setModalSlides(slides);
        setModalIndex(startIndex);
        setTimeout(() => setModalVisible(true), 60);
        if (onOpenGallery) onOpenGallery(item);
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalSlides([]);
        setModalIndex(0);
    };

    // share current slide
    const onShare = async () => {
        try {
            const slide = modalSlides[modalIndex];
            if (!slide?.uri) return;

            let shareUri = slide.uri;

            // If local image (require), resolve it
            if (typeof slide.uri !== "string") {
                const resolved = Image.resolveAssetSource(slide.uri);
                shareUri = resolved.uri;
            }

            // If it's a remote URL (e.g. dev server or actual remote), download to cache
            if (typeof shareUri === "string" && (shareUri.startsWith("http") || shareUri.startsWith("https"))) {
                const fileExt = shareUri.split(".").pop()?.split("?")[0] || "jpg";
                // @ts-ignore
                const cacheFile = `${FileSystem.cacheDirectory}share_temp.${fileExt}`;
                // @ts-ignore
                const { uri } = await FileSystem.downloadAsync(shareUri, cacheFile);
                shareUri = uri;
            }

            // Check if sharing is available
            if (!(await Sharing.isAvailableAsync())) {
                alert("Sharing is not available on this device");
                return;
            }

            await Sharing.shareAsync(shareUri, {
                dialogTitle: slide.caption ?? "Shared via AarogyaConnect",
                mimeType: slide.type === "video" ? "video/mp4" : "image/jpeg",
                UTI: slide.type === "video" ? "public.movie" : "public.jpeg",
            });

        } catch (err) {
            console.warn("Share error:", err);
        }
    };


    const onModalScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const w = e.nativeEvent.layoutMeasurement.width;
        const idx = Math.round(x / w);
        if (idx !== modalIndex) setModalIndex(idx);
    };

    // render a grid thumbnail
    const renderThumb = ({ item }: { item: MediaItem }) => {
        if (item.type === "placeholder") {
            return <View style={[local.thumbWrap, { width: THUMB_SIZE, height: THUMB_SIZE, backgroundColor: "transparent", borderWidth: 0 }]} />;
        }

        const source = getSource(item.uri);

        return (
            <TouchableOpacity activeOpacity={0.92} onPress={() => openTile(item, 0)} style={[local.thumbWrap, { width: THUMB_SIZE, height: THUMB_SIZE }]}>
                {item.type === "image" ? (
                    <Image source={source} style={local.thumbImage} resizeMode="cover" />
                ) : (
                    <View style={[local.thumbImage, local.videoThumb]}>
                        <Image source={source} style={local.thumbImage} resizeMode="cover" />
                        <View style={local.playBadge}>
                            <Feather name="play" size={18} color="#fff" />
                        </View>
                    </View>
                )}
                <View style={local.captionWrap}>
                    <Text numberOfLines={1} style={local.captionText}>
                        {item.caption ?? item.author ?? "Trusted Provider"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // modal slide (image or video)
    const renderModalSlide = ({ item }: { item: Slide }) => {
        const source = getSource(item.uri);

        return (
            <View style={{ width, height: height - (Platform.OS === "ios" ? 140 : 120), alignItems: "center", justifyContent: "center" }}>
                {item.type === "image" ? (
                    <Image source={source} style={local.modalMedia} resizeMode="contain" />
                ) : (
                    <TrustVideoSlide source={source} style={local.modalMedia} />
                )}
                {item.caption ? <Text style={local.slideCaption}>{item.caption}</Text> : null}
            </View>
        );
    };

    return (
        <View style={local.container}>
            <View style={local.headerRow}>
                <View>
                    <Text style={local.title}>{title}</Text>
                    <Text style={local.subtitle}>{subtitle}</Text>
                </View>
            </View>

            <FlatList
                data={padded}
                numColumns={NUM_COLUMNS}
                keyExtractor={(i, idx) => String(i.uri ?? "ph") + "-" + idx}
                renderItem={renderThumb}
                columnWrapperStyle={{ justifyContent: "space-between", marginBottom: GAP }}
                contentContainerStyle={{ paddingTop: 12, paddingHorizontal: PADDING_HORIZONTAL - 8 }}
                scrollEnabled={false}
            />

            {/* ===== MODAL VIEWER ===== */}
            <Modal
                visible={modalVisible}
                onRequestClose={closeModal}
                animationType="slide"
                transparent={false}
            >
                <View style={local.modalSafe}>
                    <StatusBar barStyle="light-content" translucent />

                    {/* ===== TOP TOOLBAR (FIXED POSITION) ===== */}
                    <View
                        style={[
                            local.toolbar,
                            {
                                position: "absolute",
                                top: insets.top,
                                left: 0,
                                right: 0,
                                zIndex: 10,
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={closeModal}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Feather name="x" size={24} color="#fff" />
                        </TouchableOpacity>

                        <View style={{ flex: 1, alignItems: "center" }}>
                            <Text numberOfLines={1} style={local.toolbarTitle}>
                                {modalSlides[modalIndex]?.caption ?? ""}
                            </Text>
                        </View>

                        <TouchableOpacity onPress={onShare}>
                            <Feather name="share-2" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* ===== CONTENT (toolbar ke niche shift) ===== */}
                    <FlatList
                        ref={(r: any) => (modalListRef.current = r)}
                        data={modalSlides}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(s, i) => String(s.uri) + "-" + i}
                        renderItem={renderModalSlide}
                        onScroll={onModalScroll}
                        contentContainerStyle={{
                            paddingTop: insets.top + TOOLBAR_HEIGHT,
                        }}
                        getItemLayout={(_, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                    />

                    {/* ===== DOTS ===== */}
                    {modalSlides.length > 1 && (
                        <View style={local.pageIndicator}>
                            {modalSlides.map((_, i) => (
                                <View
                                    key={i}
                                    style={[local.dot, i === modalIndex && local.dotActive]}
                                />
                            ))}
                        </View>
                    )}

                    {/* ===== INFO CARD ===== */}
                    <View style={local.infoCard}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={local.infoTitle}>
                                    {modalSlides[modalIndex]?.caption ?? "Details"}
                                </Text>
                            </View>

                            <TouchableOpacity style={local.openFullBtn} onPress={onShare}>
                                <Ionicons name="share-social" size={18} color="#2563EB" />
                                <Text style={{ marginLeft: 6, color: "#2563EB", fontWeight: "700" }}>
                                    Share
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={local.infoNote}>
                            यह सामग्री सरकारी या प्रमाणित स्रोतों द्वारा साझा की गई है।
                        </Text>
                    </View>
                </View>
            </Modal>


        </View>
    );
}

/* ---------------- styles ---------------- */
const local = StyleSheet.create({
    container: {
        marginTop: 6,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
        paddingHorizontal: 6,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },
    subtitle: {
        fontSize: 12,
        color: "#374151",
        marginTop: 2,
    },

    // thumbnail
    thumbWrap: {
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },
    thumbImage: {
        width: "100%",
        height: "100%",
    },
    videoThumb: {
        position: "relative",
    },
    playBadge: {
        position: "absolute",
        left: 8,
        top: 8,
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "rgba(37,99,235,0.9)",
        alignItems: "center",
        justifyContent: "center",
    },
    captionWrap: {
        position: "absolute",
        left: 6,
        right: 6,
        bottom: 6,
        backgroundColor: "rgba(0,0,0,0.45)",
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 8,
    },
    captionText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
    },

    // modal / viewer
    modalSafe: {
        flex: 1,
        backgroundColor: "#0f1724", // dark background
    },
    toolbar: {
        height: 56,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: "rgba(255,255,255,0.08)",
        borderBottomWidth: 1,
        backgroundColor: "rgba(15,23,36,0.95)",
    },

    toolbarTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },

    modalMedia: {
        width: width,
        height: Platform.OS === "ios" ? 420 : 380,
        backgroundColor: "#000",
    },
    slideCaption: {
        marginTop: 12,
        fontSize: 14,
        color: "#fff",
        textAlign: "center",
        paddingHorizontal: 12,
    },

    // page dots
    pageIndicator: {
        position: "absolute",
        bottom: Platform.OS === "ios" ? 170 : 150,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 6,
        backgroundColor: "rgba(255,255,255,0.25)",
        marginHorizontal: 6,
    },
    dotActive: {
        backgroundColor: "#2563EB",
        width: 12,
        height: 12,
        borderRadius: 8,
    },

    // bottom info card
    infoCard: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 18,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 10,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 4,
    },
    infoSub: {
        fontSize: 12,
        color: "#6B7280",
    },
    infoNote: {
        marginTop: 10,
        fontSize: 12,
        color: "#374151",
    },
    openFullBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(37,99,235,0.12)",
    },
});