import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export const LogOverlay = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Intercept console.log and console.error
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      setLogs((prev) => [...prev, `LOG: ${args.join(' ')}`].slice(-20)); // Keep last 20 logs
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs((prev) => [...prev, `ERROR: ${args.join(' ')}`].slice(-20));
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  if (!visible) {
    return (
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>LOGS</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>System Logs</Text>
        <TouchableOpacity onPress={() => setVisible(false)}>
          <Text style={{ color: 'white' }}>Close</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.logList}>
        {logs.map((log, i) => (
          <Text key={i} style={[styles.logText, log.startsWith('ERROR') && { color: '#ff4d4d' }]}>
            {log}
          </Text>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.clearBtn} onPress={() => setLogs([])}>
        <Text style={{ color: 'white' }}>Clear Logs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: { position: 'absolute', bottom: 100, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 20, zIndex: 9999 },
  container: { position: 'absolute', top: 50, left: 10, right: 10, bottom: 50, backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: 10, zIndex: 10000, padding: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#444', paddingBottom: 5 },
  headerText: { color: 'white', fontWeight: 'bold' },
  logList: { flex: 1, marginTop: 10 },
  logText: { color: '#00ff00', fontSize: 10, fontFamily: 'monospace', marginBottom: 5 },
  clearBtn: { alignItems: 'center', padding: 10, backgroundColor: '#444', borderRadius: 5, marginTop: 10 }
});