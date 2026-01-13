// app/_dashboardStyles.ts
import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
  },

  // HEADER
  header: {
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 5,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appLogo: {
    width: 80,
    height: 80,
  },
  partnerLogo: {
    width: 80,
    height: 80,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  langText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
  },
  profileCircle: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  headerUnderline: {
    height: 2,
    backgroundColor: "#FF9933",
    borderRadius: 999,
  },

  // HERO
  heroCard: {
    borderRadius: 26,
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 18,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  heroGradient: {
    padding: 16,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
  },
  heroHeader: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#2563EB",
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
  heroLine: {
    fontSize: 13,
    color: "#374151",
    marginTop: 6,
    textAlign: "center",
  },
  heroContentRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 4,
    minHeight: 150,
  },
  heroBadgesCol: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 14,
    paddingRight: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroBadgeIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    color: "#1F2937",
    fontWeight: "500",
  },
  heroLottieWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroLottieContainer: {
    width: "95%",
    aspectRatio: 1,
    marginTop: -60,
  },
  heroLottie: {
    width: "100%",
    height: "100%",
  },

  langOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
  },

  langDropdown: {
    alignSelf: "flex-end",
    marginTop: 60,        // header ke niche
    marginRight: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingVertical: 6,
    width: 150,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  langOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  langOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  langCenterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  langCenterModal: {
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  langTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },

  langCenterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  langCenterText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  langCancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
  },

  langCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },


  // SECTION TITLE
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
    marginTop: 40,
    marginLeft: 4,
    letterSpacing: 0.2,
  },

  // HEALTH ISSUE CARDS
  issueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  issueCard: {
    width: "48%",
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    minHeight: 130,
    overflow: "hidden",
  },
  issueSide: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backfaceVisibility: "hidden",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "flex-start",
  },
  issueBack: {
    backgroundColor: "#FFFFFF",
  },
  issueTips: {
    fontSize: 12,
    color: "#374151",
    marginTop: 6,
    lineHeight: 17,
  },
  issueEmojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    backgroundColor: "rgba(148,163,184,0.12)",
  },
  issueEmoji: {
    fontSize: 22,
  },
  issueTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  issueDesc: {
    fontSize: 11,
    color: "#4B5563",
  },

  // STEPS
  stepsList: {
    marginBottom: 18,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  stepNumber: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 11,
    color: "#4B5563",
  },

  // FOOTER
  /* ---------- FOOTER NAV ---------- */
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
    marginBottom: 6,   // Moves underline upward (perfect positioning)
  },

  // SWIPER
  awarenessCardModernWrap: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 6,
    height: 250,
  },

  awarenessCardModern: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 8,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  awarenessTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  awarenessIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,99,235,0.12)",
    marginRight: 12,
  },

  awarenessIconText: {
    fontSize: 22,
  },

  awarenessTitleModern: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 20,
  },

  bulletListModern: {
    marginBottom: 10,
  },

  bulletRowModern: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 2,
  },

  bulletDotModern: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
    marginTop: 7,
    marginRight: 8,
  },

  bulletTextModern: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    flex: 1,
  },

  infoLineModern: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7F1D1D",
    marginBottom: 10,
  },

  awarenessBtnModern: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
  },

  awarenessBtnTextModern: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  swiper: {
    height: 260,
    marginBottom: 28,
  },

  swiperDot: {
    backgroundColor: "#E6EEF8",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },

  swiperActiveDot: {
    backgroundColor: "#2563EB",
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 3,
  },

  swiperButtonWrapper: {
    backgroundColor: "transparent",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },

  swiperButton: {
    color: "#2563EB",
    fontSize: 32,
    paddingHorizontal: 8,
    fontWeight: "700",
  },

  // APPOINTMENT FORM
  apptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  apptTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  apptSubtitle: {
    fontSize: 12,
    color: "#111827",    // black
    fontWeight: "700",   // bold
    marginBottom: 12,
    lineHeight: 18,
  },
  apptFieldGroup: {
    marginBottom: 10,
  },
  apptLabel: {
    fontSize: 11,
    color: "#111827",   // black 
    fontWeight: "700",  // bold
    marginBottom: 4,
  },
  apptInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  apptTextarea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  apptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  apptButton: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  apptButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  apptError: {
    fontSize: 11,
    color: "#DC2626",
    marginTop: 2,
  },

  //chatbotform
  chatbotMediaThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 10,
  },

  chatbotVoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  chatbotVideoThumb: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },

  attachmentWrap: {
    marginRight: 8,
    alignItems: "center",
  },

  chatbotMediaRemove: {
    marginTop: 6,
    alignSelf: "center",
  },

  chatbotLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  chatbotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  chatbotBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  chatbotInfoText: {
    marginLeft: 12,
    color: "#6B7280",
    fontSize: 12,
  },

  chatbotSendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  chatbotHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

});
