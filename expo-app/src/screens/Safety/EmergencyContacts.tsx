import { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Alert, TouchableOpacity } from 'react-native';
import { View, Text, ScrollView, Input, InputField, Pressable } from '@gluestack-ui/themed';
import * as Contacts from 'expo-contacts';
import { v4 as uuidv4 } from 'uuid';
import { UserPlus, Trash2, Phone, Edit3, BookUser, X, Check } from 'lucide-react-native';

import { TitleAndBack } from '@components/TitleBack';
import { useSafetyStore } from '@utils/safetyStore';
import type { EmergencyContact } from '../../../@types/SafetyTypes';

export function EmergencyContacts() {
  const { emergencyContacts, addEmergencyContact, removeEmergencyContact, updateEmergencyContact } =
    useSafetyStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelationship('');
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Name and phone are required.');
      return;
    }

    if (editingId) {
      updateEmergencyContact(editingId, { name: name.trim(), phone: phone.trim(), relationship: relationship.trim() });
    } else {
      const newContact: EmergencyContact = {
        id: `ec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim(),
      };
      addEmergencyContact(newContact);
    }
    resetForm();
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setShowAddForm(true);
  };

  const handleDelete = (id: string, contactName: string) => {
    Alert.alert('Remove Contact', `Remove ${contactName} from emergency contacts?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeEmergencyContact(id),
      },
    ]);
  };

  const handleImportContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Contact access is needed to import contacts.');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (data.length === 0) {
        Alert.alert('No Contacts', 'No contacts found on your device.');
        return;
      }

      // Show first 10 contacts with phone numbers
      const contactsWithPhone = data
        .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
        .slice(0, 10);

      if (contactsWithPhone.length === 0) {
        Alert.alert('No Contacts', 'No contacts with phone numbers found.');
        return;
      }

      // Use the first contact as demonstration (in production, show a picker)
      const selected = contactsWithPhone[0];
      setName(selected.name || '');
      setPhone(selected.phoneNumbers?.[0]?.number || '');
      setRelationship('');
      setShowAddForm(true);
    } catch (err) {
      console.error('[EmergencyContacts] Import error:', err);
      Alert.alert('Error', 'Failed to import contacts.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TitleAndBack pageTitle="Emergency Contacts" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            These contacts will receive your GPS location via SMS when you trigger the SOS button.
          </Text>
        </View>

        {/* Contact List */}
        {emergencyContacts.length === 0 && !showAddForm ? (
          <View style={styles.emptyState}>
            <BookUser size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptyDesc}>
              Add contacts who should be notified during an emergency.
            </Text>
          </View>
        ) : (
          emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={styles.contactMeta}>
                  <Phone size={12} color="#6B7280" />
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                {contact.relationship ? (
                  <Text style={styles.contactRelation}>{contact.relationship}</Text>
                ) : null}
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity onPress={() => handleEdit(contact)} style={styles.actionBtn}>
                  <Edit3 size={16} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(contact.id, contact.name)}
                  style={styles.actionBtn}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <Input style={styles.input}>
              <InputField
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
            </Input>
            <Input style={styles.input}>
              <InputField
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </Input>
            <Input style={styles.input}>
              <InputField
                placeholder="Relationship (optional)"
                value={relationship}
                onChangeText={setRelationship}
              />
            </Input>
            <View style={styles.formActions}>
              <Pressable style={styles.cancelBtn} onPress={resetForm}>
                <X size={16} color="#6B7280" />
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Check size={16} color="#fff" />
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          {!showAddForm && (
            <>
              <Pressable style={styles.addButton} onPress={() => setShowAddForm(true)}>
                <UserPlus size={18} color="#fff" />
                <Text style={styles.addButtonText}>Add Contact Manually</Text>
              </Pressable>
              <Pressable style={styles.importButton} onPress={handleImportContact}>
                <BookUser size={18} color="#2752B7" />
                <Text style={styles.importButtonText}>Import from Phone</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  infoBanner: { backgroundColor: '#EFF6FF', borderRadius: 12, marginHorizontal: 16, marginTop: 12, padding: 14, borderWidth: 1, borderColor: '#BFDBFE' },
  infoText: { fontSize: 13, color: '#1E40AF', lineHeight: 19 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  contactCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 10, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  contactInfo: { flex: 1, gap: 4 },
  contactName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  contactMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  contactPhone: { fontSize: 13, color: '#6B7280' },
  contactRelation: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },
  contactActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  formCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  input: { borderRadius: 12, backgroundColor: '#fff' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#E5E7EB', borderRadius: 10, paddingVertical: 12 },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#22C55E', borderRadius: 10, paddingVertical: 12 },
  saveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  bottomActions: { marginHorizontal: 16, marginTop: 20, gap: 10 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#2752B7', borderRadius: 12, paddingVertical: 14 },
  addButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  importButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: '#BFDBFE' },
  importButtonText: { fontSize: 15, fontWeight: '600', color: '#2752B7' },
});
