import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TrackingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Tracking</Text>
      <Text style={styles.subtitle}>GPS tracking will be displayed here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});
