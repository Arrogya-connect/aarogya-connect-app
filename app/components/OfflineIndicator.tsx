import { useNetInfo } from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IS_OFFLINE_SIMULATED } from '../profile-screen';
import { OfflineQueue } from '../services/OfflineQueue';

export default function OfflineIndicator() {
    const netInfo = useNetInfo();
    const [pendingCount, setPendingCount] = useState(0);

    // Poll queue length (in a real app, use an event emitter or observer)
    useEffect(() => {
        const interval = setInterval(async () => {
            const q = await OfflineQueue.getQueue();
            setPendingCount(q.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const isOffline = netInfo.isConnected === false || IS_OFFLINE_SIMULATED;

    if (!isOffline && pendingCount === 0) return null;

    return (
        <View style={[styles.container, isOffline ? styles.offline : styles.syncing]}>
            <Text style={styles.text}>
                {isOffline
                    ? `📡 Offline Mode - ${pendingCount} items queued`
                    : `🔄 Syncing... ${pendingCount} remaining`}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        zIndex: 100, // On top
    },
    offline: {
        backgroundColor: '#EF4444',
    },
    syncing: {
        backgroundColor: '#F59E0B',
    },
    text: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
});
