import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE } from "./constants/api";

/* ==========================================================================
   1. TYPES & INTERFACES
   ========================================================================== */

type RecordStatus = "resolved" | "pending" | "appointment_generated" | "confirmed";

interface RecordItem {
  id: string;
  queryNo: string;
  title: string;
  date: string;
  phone: string;
  description: string;
  status: RecordStatus;
  doctorResponse?: string;
  doctorName?: string;
  doctorDetails?: string;
  attachments?: Array<{ id: string; type: "image" | "video" | "pdf"; label: string }>;
}

/* ==========================================================================
   2. SUB-COMPONENTS
   ========================================================================== */

const RecordCard = ({ item, onPress }: { item: RecordItem; onPress: (i: RecordItem) => void }) => {
  const getStatusUI = (status: RecordStatus) => {
    switch (status) {
      case "resolved": return { color: "#22C55E", icon: "check-circle", label: "Resolved" };
      case "confirmed": return { color: "#7C3AED", icon: "calendar", label: "Confirmed" };
      case "appointment_generated": return { color: "#3B82F6", icon: "file-plus", label: "Generated" };
      default: return { color: "#F59E0B", icon: "clock", label: "Pending" };
    }
  };

  const ui = getStatusUI(item.status);

  return (
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.85}>
      <BlurView intensity={25} style={styles.recordCard}>
        <View style={[styles.statusStrip, { backgroundColor: ui.color }]} />
        <View style={{ marginLeft: 12 }}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordQueryNo}>{ui.label} #{item.queryNo}</Text>
            <Feather name={ui.icon as any} size={16} color={ui.color} />
          </View>
          <Text style={styles.recordTitle}>{item.title}</Text>
          <Text style={styles.recordDate}>{item.date}</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

/* ==========================================================================
   3. DATA FETCHING & MERGING
   ========================================================================== */

export default function RecordsScreen() {
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [isPrescriptionVisible, setIsPrescriptionVisible] = useState(false);

  const [completedRecords, setCompletedRecords] = useState<RecordItem[]>([]);
  const [activeRecords, setActiveRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("sessionToken");
        const headers = { "x-session-token": token || "" };

        // 1. Fetch Records (Chatbot Queries)
        const recRes = await fetch(`${API_BASE}/api/records?limit=50&page=1`, { headers });
        const recJson = await recRes.json();
        const recordsRaw = (recRes.ok && recJson.ok && Array.isArray(recJson.data)) ? recJson.data : [];

        // 2. Fetch Appointments
        // NOTE: If your backend doesn't have GET /api/appointments yet, this might fail or return 404.
        // We handle that gracefully by defaulting to [].
        let appointmentsRaw: any[] = [];
        try {
          const appRes = await fetch(`${API_BASE}/api/appointments`, { headers });
          const appJson = await appRes.json();
          // Assuming your appointment API returns { ok: true, data: [...] } or just [...]
          if (appRes.ok) {
            appointmentsRaw = Array.isArray(appJson.data) ? appJson.data : (Array.isArray(appJson) ? appJson : []);
          }
        } catch (e) {
          console.log("Appointments fetch warning:", e);
        }

        if (!mounted) return;

        // 3. Process & Merge Records
        const processedRecords: RecordItem[] = recordsRaw.map((r: any) => ({
          id: r._id || r.id,
          queryNo: r.queryNumber || "N/A",
          title: r.summary || "Health Query",
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
          phone: r.phone || "",
          description: r.details || r.summary || "",
          status: r.status === "completed" || r.status === "resolved" ? "resolved" : "pending",
          doctorResponse: r.doctorResponse,
          doctorName: r.doctorName,
          doctorDetails: r.doctorDetails,
          attachments: r.attachments?.map((a: any) => ({
            id: a.gridFsId || "att",
            type: a.mimeType?.includes("image") ? "image" : "pdf",
            label: a.filename || "Attachment"
          }))
        }));

        // 4. Process & Merge Appointments
        const processedAppointments: RecordItem[] = appointmentsRaw.map((a: any) => ({
          id: a._id || a.id,
          queryNo: "APP-" + (a._id ? a._id.slice(-4).toUpperCase() : "0000"),
          title: "Appointment: " + (a.problem || "General"),
          date: a.preferredDate ? new Date(a.preferredDate).toLocaleDateString() : "N/A",
          phone: a.mobile || "",
          description: `Booked for ${a.preferredTime || "N/A"}. Problem: ${a.problem}`,
          status: a.status === "confirmed" || a.status === "completed" ? "confirmed" : "appointment_generated", // map 'pending' appt to 'appointment_generated' UI status
          doctorName: a.status === 'confirmed' ? "Assigned Doctor" : undefined,
          doctorResponse: a.status === 'confirmed' ? "Appointment Confirmed. Please arrive 15 mins early." : undefined
        }));

        // 5. Combine
        const allItems = [...processedRecords, ...processedAppointments];

        // 6. Split into Categories
        // Resolved: Status is 'resolved' (record) or 'confirmed' (appointment)
        // Active: 'pending' (record) or 'appointment_generated' (pending appointment)

        const completed = allItems.filter(i => i.status === "resolved" || i.status === "confirmed");
        const active = allItems.filter(i => i.status === "pending" || i.status === "appointment_generated");

        setCompletedRecords(completed);
        setActiveRecords(active);

      } catch (err) {
        console.error("Data load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []);

  const closeMainModal = () => setSelectedRecord(null);
  const openPrescription = () => setIsPrescriptionVisible(true);
  const closePrescription = () => setIsPrescriptionVisible(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <LinearGradient colors={["#F3F4F6", "#EFF6FF"]} style={{ flex: 1 }}>

        {/* APP HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require("../assets/images/app-logo.png")} style={styles.logo} />
            <Image source={require("../assets/images/partner-logo.png")} style={styles.partnerLogo} />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.langBtn}><Text style={styles.langText}>EN ▼</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/profile-screen")}>
              <View style={styles.profileCircle}><Text style={styles.profileInitial}>AC</Text></View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerUnderline} />

        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          {/* HERO COMPONENT */}
          <BlurView intensity={65} tint="light" style={styles.heroCard}>
            <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} style={styles.heroGradient}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>Your Health Records</Text>
                  <Text style={styles.heroSubtitle}>Managed via AarogyaConnect AI</Text>
                  <View style={styles.heroStats}>
                    <View style={styles.statPill}>
                      <Feather name="check-circle" size={14} color="#16A34A" />
                      <Text style={styles.statText}>{completedRecords.length} Completed</Text>
                    </View>
                    <View style={styles.statPillWarn}>
                      <Feather name="clock" size={14} color="#D97706" />
                      <Text style={styles.statText}>{activeRecords.length} Active</Text>
                    </View>
                  </View>
                </View>
                <Feather name="activity" size={46} color="#2563EB" />
              </View>
            </LinearGradient>
          </BlurView>

          {/* LIST SECTIONS */}
          <Text style={styles.sectionTitle}>Resolved & Confirmed</Text>
          {completedRecords.map(item => <RecordCard key={item.id} item={item} onPress={setSelectedRecord} />)}

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Generated & Pending</Text>
          {activeRecords.map(item => <RecordCard key={item.id} item={item} onPress={setSelectedRecord} />)}
        </ScrollView>

        {/* ------------------------------------------------------------------
            MODAL: RECORD DETAILS
        ------------------------------------------------------------------ */}
        <Modal visible={!!selectedRecord && !isPrescriptionVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {selectedRecord && (
                <>
                  <LinearGradient colors={["#2563EB", "#1E40AF"]} style={styles.modalHeader}>
                    <Text style={styles.modalHeaderTitle}>
                      {selectedRecord.status.includes("appointment") ? "Appointment" : "Query"} #{selectedRecord.queryNo}
                    </Text>
                    <Text style={styles.modalHeaderSub}>{selectedRecord.title}</Text>
                  </LinearGradient>

                  <View style={styles.modalBody}>
                    {selectedRecord.doctorResponse && (
                      <View style={styles.doctorResponseBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                          <Feather name="user-check" size={16} color="#16A34A" />
                          <Text style={styles.doctorLabel}>DOCTOR'S RESPONSE</Text>
                        </View>
                        <Text style={styles.doctorResponseText}>{selectedRecord.doctorResponse}</Text>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <Feather name="phone" size={18} color="#2563EB" />
                      <Text style={styles.infoText}>{selectedRecord.phone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Feather name="file-text" size={18} color="#2563EB" />
                      <Text style={styles.infoText}>{selectedRecord.description}</Text>
                    </View>

                    {selectedRecord.status === "resolved" && (
                      <TouchableOpacity style={styles.prescriptionBtn} onPress={openPrescription}>
                        <Feather name="clipboard" size={18} color="#FFF" />
                        <Text style={styles.prescriptionBtnText}>View Digital Prescription</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={closeMainModal} style={styles.closeBtn}>
                      <Text style={styles.closeBtnText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* ------------------------------------------------------------------
            MODAL: DIGITAL PRESCRIPTION
        ------------------------------------------------------------------ */}
        <Modal visible={isPrescriptionVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { width: '92%' }]}>
              <LinearGradient colors={["#111827", "#1F2937"]} style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Digital Prescription</Text>
                <Text style={styles.modalHeaderSub}>AarogyaConnect Verified</Text>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={styles.prescDoctorName}>{selectedRecord?.doctorName}</Text>
                <Text style={styles.prescDoctorDetails}>{selectedRecord?.doctorDetails}</Text>
                <View style={styles.prescDivider} />
                <Text style={styles.prescLabel}>Rx / Prescription Notes:</Text>
                <Text style={styles.prescContent}>{selectedRecord?.doctorResponse}</Text>
                <Text style={styles.prescDate}>Date: {selectedRecord?.date}</Text>

                <TouchableOpacity onPress={closePrescription} style={[styles.closeBtn, { backgroundColor: '#2563EB' }]}>
                  <Text style={styles.closeBtnText}>Back to Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* FLOATING ACTION BUTTON */}
        <TouchableOpacity style={styles.fab}><Feather name="plus" size={22} color="#FFF" /></TouchableOpacity>

        {/* BOTTOM NAVIGATION */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomItem} onPress={() => router.replace("/dashboard")}><Text style={styles.bottomText}>Home</Text></TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem}><View style={styles.bottomActiveLine} /><Text style={styles.bottomTextActive}>Records</Text></TouchableOpacity>
          <TouchableOpacity style={styles.bottomItem} onPress={() => router.push("/profile-screen")}><Text style={styles.bottomText}>Profile</Text></TouchableOpacity>
        </View>

      </LinearGradient>
    </SafeAreaView>
  );
}

/* ==========================================================================
   5. STYLES (Retained exact look)
   ========================================================================== */

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 90, height: 30, resizeMode: "contain" },
  partnerLogo: { width: 90, height: 30, resizeMode: "contain" },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB" },
  langText: { fontSize: 12, fontWeight: "600" },
  profileCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  profileInitial: { color: "#FFF", fontWeight: "700" },
  headerUnderline: { height: 2, backgroundColor: "#F97316" },
  heroCard: { margin: 16, borderRadius: 22, overflow: "hidden" },
  heroGradient: { padding: 20 },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  heroSubtitle: { marginTop: 6, color: "#2563EB", fontWeight: "600" },
  heroStats: { flexDirection: "row", marginTop: 12, gap: 10 },
  statPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statPillWarn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statText: { fontSize: 11, fontWeight: "700" },
  sectionTitle: { marginHorizontal: 16, marginBottom: 8, fontSize: 13, fontWeight: "800", color: "#111827" },
  recordCard: { marginHorizontal: 16, marginBottom: 16, padding: 18, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.96)", elevation: 4 },
  statusStrip: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  recordHeader: { flexDirection: "row", justifyContent: "space-between" },
  recordQueryNo: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  recordTitle: { marginTop: 6, fontSize: 15, fontWeight: "700", color: "#111827" },
  recordDate: { marginTop: 6, fontSize: 12, color: "#6B7280" },
  fab: { position: "absolute", bottom: 92, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#F97316", justifyContent: "center", alignItems: "center", elevation: 6 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 64, backgroundColor: "#111827", flexDirection: "row" },
  bottomItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  bottomText: { color: "#9CA3AF" },
  bottomTextActive: { color: "#FFF", fontWeight: "700" },
  bottomActiveLine: { width: 28, height: 3, backgroundColor: "#F97316", borderRadius: 999, marginBottom: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
  modalCard: { width: "88%", backgroundColor: "#FFF", borderRadius: 22, overflow: "hidden" },
  modalHeader: { padding: 18 },
  modalHeaderTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  modalHeaderSub: { marginTop: 4, fontSize: 14, color: "#E5E7EB" },
  modalBody: { padding: 18 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  infoText: { fontSize: 14, color: "#111827", flex: 1, lineHeight: 20 },
  closeBtn: { marginTop: 14, paddingVertical: 14, borderRadius: 16, backgroundColor: "#2563EB", alignItems: "center" },
  closeBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  doctorResponseBox: { backgroundColor: "#F0FDF4", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#DCFCE7", marginBottom: 20 },
  doctorLabel: { fontSize: 12, fontWeight: "900", color: "#16A34A", marginLeft: 6 },
  doctorResponseText: { fontSize: 14, color: "#14532D", fontWeight: "500" },
  prescriptionBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 10 },
  prescriptionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  prescDoctorName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  prescDoctorDetails: { fontSize: 13, color: '#2563EB', fontWeight: '600', marginTop: 2 },
  prescDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 15 },
  prescLabel: { fontSize: 12, fontWeight: '900', color: '#6B7280', marginBottom: 5 },
  prescContent: { fontSize: 15, color: '#111827', lineHeight: 22 },
  prescDate: { marginTop: 20, fontSize: 12, color: '#9CA3AF' }
});