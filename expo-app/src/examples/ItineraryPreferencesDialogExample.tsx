import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ItineraryPreferencesDialog } from '../components/Itinerary/ItineraryPreferencesModal';

export function ExampleUsage() {
  const [showDialog, setShowDialog] = useState<boolean>(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => setShowDialog(true)}
        style={{
          backgroundColor: '#2752B7',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          Abrir Modal de Criação de Itinerário
        </Text>
      </TouchableOpacity>

      <ItineraryPreferencesDialog
        showAlertDialog={showDialog}
        setShowAlertDialog={setShowDialog}
      />
    </View>
  );
}
