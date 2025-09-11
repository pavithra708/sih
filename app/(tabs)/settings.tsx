import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { Globe, MapPin, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { tourist, logout } = useAuth();
  const { isTracking, startTracking, stopTracking } = useLocation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  const handleLanguageChange = () => {
    Alert.alert(
      t('settings.language'),
      'Select Language',
      [
        ...languages.map(lang => ({
          text: lang.name,
          onPress: () => i18n.changeLanguage(lang.code),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTrackingToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        await startTracking();
        Alert.alert('Success', t('alerts.trackingStarted'));
      } else {
        await stopTracking();
        Alert.alert('Success', t('alerts.trackingStopped'));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update tracking settings');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange 
  }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingLeft}>
        {icon}
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#767577', true: '#2196F3' }}
            thumbColor={switchValue ? '#fff' : '#f4f3f4'}
          />
        ) : (
          <ChevronRight size={20} color="#999" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <SettingItem
          icon={<Globe size={24} color="#2196F3" />}
          title={t('settings.language')}
          subtitle={`Current: ${languages.find(l => l.code === i18n.language)?.name || 'English'}`}
          onPress={handleLanguageChange}
        />

        <SettingItem
          icon={<MapPin size={24} color="#4CAF50" />}
          title={t('settings.tracking')}
          subtitle="Share your location with emergency contacts"
          showSwitch
          switchValue={isTracking}
          onSwitchChange={handleTrackingToggle}
        />

        <SettingItem
          icon={<Bell size={24} color="#FF9800" />}
          title={t('settings.notifications')}
          subtitle="Manage alert preferences"
          onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon={<Shield size={24} color="#9C27B0" />}
          title={t('settings.privacy')}
          subtitle="Data and privacy settings"
          onPress={() => Alert.alert('Privacy', 'Your data is securely encrypted and stored')}
        />

        <SettingItem
          icon={<HelpCircle size={24} color="#607D8B" />}
          title={t('settings.support')}
          subtitle="Help center and FAQ"
          onPress={() => Alert.alert('Support', 'Contact support: support@touristsafety.com')}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon={<LogOut size={24} color="#F44336" />}
          title={t('settings.logout')}
          subtitle="Sign out of your account"
          onPress={handleLogout}
        />
      </View>

      {tourist && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>
            Logged in as: {tourist.name}
          </Text>
          <Text style={styles.userInfoSubtext}>
            ID: {tourist.id.slice(-8).toUpperCase()}
          </Text>
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
  content: {
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  settingRight: {
    marginLeft: 12,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
  },
  userInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userInfoSubtext: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
});