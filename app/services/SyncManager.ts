import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { API_BASE } from '../constants/api'; // Ensure this path is correct
import { OfflineQueue, QueueItem } from './OfflineQueue';

export const SyncManager = {
    /**
     * Initialize the sync manager (call this in your root layout/app)
     */
    init: () => {
        // Listen for network state changes
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            if (state.isConnected && state.isInternetReachable) {
                console.log('[SyncManager] Online detected. Attempting sync...');
                SyncManager.processQueue();
            }
        });
        return unsubscribe;
    },

    /**
     * Process all pending items in the queue
     */
    processQueue: async () => {
        const queue = await OfflineQueue.getQueue();
        if (queue.length === 0) return;

        console.log(`[SyncManager] Found ${queue.length} pending items.`);

        // Process sequentially
        for (const item of queue) {
            if (item.status === 'FAILED') continue; // Skip previously failed items for now (or retry logic)

            try {
                await SyncManager.syncItem(item);
                // If successful, remove from queue
                await OfflineQueue.removeFromQueue(item.id);
            } catch (err) {
                console.error(`[SyncManager] Failed to sync item ${item.id}`, err);
                // Optionally mark as failed or retry count
            }
        }
    },

    /**
     * Sync a single item based on its type
     */
    syncItem: async (item: QueueItem) => {
        const token = await AsyncStorage.getItem("sessionToken");
        if (!token) throw new Error("No session token available for sync");

        if (item.type === 'APPOINTMENT') {
            const res = await fetch(`${API_BASE}/api/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-session-token": token,
                },
                body: JSON.stringify(item.data),
            });

            const json = await res.json();
            if (!res.ok || !json.ok) {
                throw new Error(json.error || "Server rejected sync");
            }
            console.log(`[SyncManager] Successfully synced Record ${item.id}`);
        }

        console.log(`[SyncManager] Successfully synced Record ${item.id}`);
        if (item.type === 'RECORD') {
            const { queryNumber, phone, summary, attachments } = item.data;

            // 1. Get Signature
            const sigRes = await fetch(`${API_BASE}/api/media/signature`, {
                headers: { "x-session-token": token },
            });
            const sigData = await sigRes.json();
            if (!sigRes.ok || !sigData.ok) throw new Error("Failed to get upload signature for sync");

            const { signature, timestamp, cloudName, apiKey, folder } = sigData;
            const uploadedAttachments: any[] = [];

            // 2. Upload Files
            for (let i = 0; i < attachments.length; i++) {
                const media = attachments[i];
                const data = new FormData();
                data.append("file", {
                    uri: media.uri,
                    type: media.type === 'video' ? 'video/mp4' : 'image/jpeg',
                    name: media.name || `sync_file_${i}.jpg`
                } as any);
                data.append("api_key", apiKey);
                data.append("timestamp", timestamp.toString());
                data.append("signature", signature);
                if (folder) data.append("folder", folder);

                const resourceType = media.type === "video" ? "video" : "image";
                const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

                console.log(`[SyncManager] Uploading file ${i + 1}/${attachments.length} for item ${item.id}`);
                const uploadRes = await fetch(cloudUrl, { method: "POST", body: data });
                const uploadJson = await uploadRes.json();

                if (uploadJson.secure_url) {
                    uploadedAttachments.push({
                        uri: uploadJson.secure_url,
                        type: resourceType,
                        name: media.name || "upload"
                    });
                } else {
                    console.error(`[SyncManager] Cloudinary upload failed`, uploadJson);
                    throw new Error("Cloudinary upload failed during sync");
                }
            }

            // 3. Submit Record
            const payload = {
                queryNumber,
                phone,
                summary,
                attachments: uploadedAttachments
            };

            const res = await fetch(`${API_BASE}/api/records`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-session-token": token,
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok || !json.ok) throw new Error(json.error || "Server rejected record sync");

            console.log(`[SyncManager] Successfully synced record ${item.id}`);
        }
    },

    /**
     * Manually trigger a sync (useful when toggling simulation off)
     */
    forceSync: () => {
        console.log('[SyncManager] Force sync triggered manually.');
        SyncManager.processQueue();
    }
};
