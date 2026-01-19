import AsyncStorage from '@react-native-async-storage/async-storage';

export type RequestType = 'APPOINTMENT' | 'RECORD';

export interface QueueItem {
    id: string;
    type: RequestType;
    data: any; // The payload (form fields, image paths, etc.)
    timestamp: number;
    status: 'PENDING' | 'FAILED';
}

const QUEUE_KEY = "offline_queue_v1";

export const OfflineQueue = {
    /**
     * Add a new item to the offline queue
     */
    addToQueue: async (type: RequestType, data: any) => {
        try {
            const newItem: QueueItem = {
                id: Date.now().toString() + Math.random().toString().slice(2, 6),
                type,
                data,
                timestamp: Date.now(),
                status: 'PENDING',
            };

            const existing = await OfflineQueue.getQueue();
            const updated = [...existing, newItem];
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
            console.log(`[OfflineQueue] Added item ${newItem.id} of type ${type}`);
            return newItem;
        } catch (err) {
            console.error("[OfflineQueue] Failed to add item", err);
            throw err;
        }
    },

    /**
     * Get all pending items
     */
    getQueue: async (): Promise<QueueItem[]> => {
        try {
            const raw = await AsyncStorage.getItem(QUEUE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (err) {
            console.error("[OfflineQueue] Failed to get queue", err);
            return [];
        }
    },

    /**
     * Remove an item from the queue (after successful sync)
     */
    removeFromQueue: async (id: string) => {
        try {
            const existing = await OfflineQueue.getQueue();
            const updated = existing.filter(item => item.id !== id);
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
            console.log(`[OfflineQueue] Removed item ${id}`);
        } catch (err) {
            console.error("[OfflineQueue] Failed to remove item", err);
        }
    },

    /**
     * Clear entire queue (debug only)
     */
    clearQueue: async () => {
        await AsyncStorage.removeItem(QUEUE_KEY);
    }
};
