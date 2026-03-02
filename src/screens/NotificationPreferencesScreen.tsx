import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../services/api';
import { Colors } from '../constants/theme';

export default function NotificationPreferencesScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusChangeEnabled, setStatusChangeEnabled] = useState(true);
  const [assignmentEnabled, setAssignmentEnabled] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await api.getNotificationPreferences();
      setStatusChangeEnabled(prefs.statusChangeEnabled);
      setAssignmentEnabled(prefs.assignmentEnabled);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (field: 'statusChange' | 'assignment', value: boolean) => {
    const newPrefs = {
      statusChangeEnabled: field === 'statusChange' ? value : statusChangeEnabled,
      assignmentEnabled: field === 'assignment' ? value : assignmentEnabled,
    };

    // Optimistically update UI
    if (field === 'statusChange') {
      setStatusChangeEnabled(value);
    } else {
      setAssignmentEnabled(value);
    }

    try {
      setSaving(true);
      await api.updateNotificationPreferences(newPrefs);
    } catch (error) {
      console.error('Failed to update preference:', error);
      
      // Revert on error
      if (field === 'statusChange') {
        setStatusChangeEnabled(!value);
      } else {
        setAssignmentEnabled(!value);
      }
      
      Alert.alert(
        'Error',
        'Failed to update preference. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => updatePreference(field, value) },
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryOrange} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>
        <Text style={styles.sectionDescription}>
          Choose which notifications you want to receive
        </Text>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primaryOrange} />
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Status Updates</Text>
              <Text style={styles.preferenceDescription}>
                Get notified when your report status changes
              </Text>
            </View>
          </View>
          <Switch
            value={statusChangeEnabled}
            onValueChange={(value) => updatePreference('statusChange', value)}
            disabled={saving}
            trackColor={{ false: '#767577', true: Colors.primaryOrange }}
            thumbColor={statusChangeEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Ionicons name="person-outline" size={24} color={Colors.primaryOrange} />
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Assignment Notifications</Text>
              <Text style={styles.preferenceDescription}>
                Get notified when your report is assigned to a team member
              </Text>
            </View>
          </View>
          <Switch
            value={assignmentEnabled}
            onValueChange={(value) => updatePreference('assignment', value)}
            disabled={saving}
            trackColor={{ false: '#767577', true: Colors.primaryOrange }}
            thumbColor={assignmentEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {saving && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color={Colors.primaryOrange} />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
  savingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  savingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
