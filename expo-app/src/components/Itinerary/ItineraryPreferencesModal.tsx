import { useEffect, useState } from "react";
import {
  ScrollView,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import * as Contacts from 'expo-contacts';
import { Contact } from "expo-contacts";

import RNDateTimePicker from "@react-native-community/datetimepicker";

import { styles } from './styles/itineraryStyles';

import { originCountries } from "../../data/places";

import { AuthNavigationProp } from "@routes/auth.routes";

import { X, Plus, Minus, ChevronDown } from "lucide-react-native";

type GenerateItineraryPreferencesFormTypes = {
  budget: number,
  peopleQuantity: number,
  acconpanying: "Family" | "Friends",
  tripStyle: "Urban" | "Countryside",
  vehicleLocomotionTypes: "Car" | "Motorcycle" | "Foot" | "Train" | "Boat" | "Bicycle",
  locomotionMethod: Array<GenerateItineraryPreferencesFormTypes["vehicleLocomotionTypes"]>,
  specialWish: string
}

type ItineraryPreferencesModalTypes = {
  showAlertDialog: boolean,
  setShowAlertDialog: (show: boolean) => void
}

export function ItineraryPreferencesModal({ showAlertDialog, setShowAlertDialog }: ItineraryPreferencesModalTypes) {
  const [itineraryTitle, setItineraryTitle] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
  const [showDatePickers, setShowDatePickers] = useState<boolean>(false);
  const [days, setDays] = useState<number>(1);
  const [originCountry, setOriginCountry] = useState<string>("");
  const [showOriginCountrySelector, setShowOriginCountrySelector] = useState<boolean>(false);
  const [includeContacts, setIncludeContacts] = useState<boolean>(false);
  const [listContacts, setListContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [showContacts, setShowContacts] = useState<boolean>(false);

  // Campos de preferências da viagem
  const [budget, setBudget] = useState<GenerateItineraryPreferencesFormTypes["budget"]>(0);
  const [peopleQuantity, setPeopleQuantity] = useState<GenerateItineraryPreferencesFormTypes["peopleQuantity"]>(0);
  const [acconpanyingType, setAcconpanyingType] = useState<GenerateItineraryPreferencesFormTypes["acconpanying"]>();
  const [tripStyle, setTripStyle] = useState<Array<"Urban" | "Countryside">>([]);
  const [specialWish, setSpecialWish] = useState<GenerateItineraryPreferencesFormTypes["specialWish"]>("");
  const [locomotionMethod, setLocomotionMethod] = useState<Array<GenerateItineraryPreferencesFormTypes["vehicleLocomotionTypes"]>>([]);

  const navigation = useNavigation<AuthNavigationProp>();

  const calculateDays = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setStartDate(selectedDate);
      const newDays = calculateDays(selectedDate, endDate);
      setDays(newDays);
      setTimeout(() => setShowDatePickers(false), 300);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setEndDate(selectedDate);
      const newDays = calculateDays(startDate, selectedDate);
      setDays(newDays);
      setTimeout(() => setShowDatePickers(false), 300);
    }
  };

  const incrementDays = () => {
    const newDays = days + 1;
    setDays(newDays);
    const newEndDate = new Date(startDate.getTime() + (newDays - 1) * 24 * 60 * 60 * 1000);
    setEndDate(newEndDate);
  };

  const decrementDays = () => {
    if (days > 1) {
      const newDays = days - 1;
      setDays(newDays);
      const newEndDate = new Date(startDate.getTime() + (newDays - 1) * 24 * 60 * 60 * 1000);
      setEndDate(newEndDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleAccompanying = (type: "Family" | "Friends") => {
    setAcconpanyingType(type);
  };

  const handleTripStyle = (type: "Urban" | "Countryside" | "Both") => {
    if (type === "Both") {
      if (tripStyle.includes("Urban") && tripStyle.includes("Countryside")) {
        setTripStyle([]);
      } else {
        setTripStyle(["Urban", "Countryside"]);
      }
    } else {
      if (tripStyle.includes(type)) {
        setTripStyle(tripStyle.filter(item => item !== type));
      } else {
        const newTripStyle = [...tripStyle, type];
        setTripStyle(newTripStyle);
      }
    }
  };

  const handleLocomotion = (type: GenerateItineraryPreferencesFormTypes["vehicleLocomotionTypes"]) => {
    if (locomotionMethod.includes(type)) {
      setLocomotionMethod(locomotionMethod.filter(item => item !== type));
    } else if (locomotionMethod.length < 5) {
      setLocomotionMethod([...locomotionMethod, type]);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.FirstName, Contacts.Fields.LastName],
        });

        if (data.length > 0) {
          setListContacts(data);
        }
      }
    })();
  }, []);

  const toggleContactSelection = () => {
    const newValue = !includeContacts;
    setIncludeContacts(newValue);
    if (newValue) {
      setShowContacts(true);
    } else {
      setSelectedContacts([]);
    }
  };

  const handleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isAlreadySelected = prev.some(c => c.id === contact.id);
      if (isAlreadySelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const isContactSelected = (contact: Contact) => {
    return selectedContacts.some(c => c.id === contact.id);
  };

  const getLocomotionLabel = (type: GenerateItineraryPreferencesFormTypes["vehicleLocomotionTypes"]) => {
    const labels = {
      "Car": "Carro",
      "Motorcycle": "Moto", 
      "Foot": "Caminhada",
      "Train": "Trem",
      "Boat": "Barco",
      "Bicycle": "Bicicleta"
    };
    return labels[type];
  };

  const handleClose = () => setShowAlertDialog(false);

  return (
    <>
      <Modal
        visible={showAlertDialog}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Itinerário Surpresa</Text>
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={() => {
                  handleClose();
                  navigation.navigate("UserPreferences", {
                    title: itineraryTitle,
                    dateBegin: startDate,
                    dateEnd: endDate,
                    days: days,
                    continent: "",
                    countries: [],
                    originCountry: originCountry,
                    contacts: selectedContacts,
                    budget,
                    peopleQuantity,
                    acconpanying: acconpanyingType!,
                    tripStyleTypes: tripStyle[0] || "Urban",
                    tripStyle,
                    vehicleLocomotionTypes: locomotionMethod[0] || "Car",
                    locomotionMethod,
                    specialWish
                  });
                }}
              >
                <Text style={styles.nextButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Título do itinerário</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Insira o título deste itinerário"
                  value={itineraryTitle}
                  onChangeText={setItineraryTitle}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.section}>
                <View style={styles.dateRow}>
                  <View style={styles.dateColumn}>
                    <Text style={styles.dateLabel}>Início da viagem</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePickers(!showDatePickers)}
                    >
                      <Text style={styles.dateButtonTitle}>Definir Datas</Text>
                      <Text style={styles.dateButtonSubtitle}>
                        {formatDate(startDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.arrowContainer}>
                    <ChevronDown size={20} color="#666" />
                  </View>

                  <View style={styles.dateColumn}>
                    <Text style={styles.dateLabel}>Fim da viagem</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePickers(!showDatePickers)}
                    >
                      <Text style={styles.dateButtonTitle}>Definir Datas</Text>
                      <Text style={styles.dateButtonSubtitle}>
                        {formatDate(endDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {showDatePickers && (
                  <View style={styles.calendarContainer}>
                    <View style={styles.datePickersRow}>
                      <View style={styles.datePickerColumn}>
                        <Text style={styles.datePickerLabel}>Data de Início</Text>
                        <RNDateTimePicker
                          mode="date"
                          value={startDate}
                          minimumDate={new Date()}
                          maximumDate={new Date(2030, 11, 31)}
                          onChange={handleStartDateChange}
                        />
                      </View>
                      <View style={styles.datePickerColumn}>
                        <Text style={styles.datePickerLabel}>Data de Fim</Text>
                        <RNDateTimePicker
                          mode="date"
                          value={endDate}
                          minimumDate={startDate}
                          maximumDate={new Date(2030, 11, 31)}
                          onChange={handleEndDateChange}
                        />
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.dayCounter}>
                  <View style={styles.dayCounterRow}>
                    <TouchableOpacity
                      style={styles.dayButton}
                      onPress={decrementDays}
                    >
                      <Minus size={20} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.dayDisplay}>
                      <Text style={styles.dayNumber}>{days}</Text>
                      <Text style={styles.dayLabel}>
                        {days === 1 ? 'Dia' : 'Dias'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.dayButton}
                      onPress={incrementDays}
                    >
                      <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>País de Origem</Text>
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setShowOriginCountrySelector(!showOriginCountrySelector)}
                >
                  <Text style={[styles.selectorText, originCountry && styles.selectorTextSelected]}>
                    {originCountry || "Selecione seu país de origem"}
                  </Text>
                  <ChevronDown size={16} color="#666" />
                </TouchableOpacity>

                {showOriginCountrySelector && (
                  <View style={styles.dropdownContainer}>
                    <ScrollView style={styles.dropdown}>
                      {originCountries.map((country) => (
                        <TouchableOpacity
                          key={country}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setOriginCountry(country);
                            setShowOriginCountrySelector(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{country}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Orçamento máximo a ser gasto nesta viagem</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={String(budget)}
                  onChangeText={text => setBudget(Number(text.replace(/[^0-9]/g, "")))}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Quantas pessoas te acompanham?</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={String(peopleQuantity)}
                  onChangeText={text => setPeopleQuantity(Number(text.replace(/[^0-9]/g, "")))}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Quem te acompanha?</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity
                    style={[
                      styles.contactOption,
                      acconpanyingType === "Family" && styles.contactOptionSelected,
                      { paddingHorizontal: 16, paddingVertical: 12 }
                    ]}
                    onPress={() => handleAccompanying("Family")}
                  >
                    <Text style={[styles.contactOptionTitle, { fontSize: 16, flex: 1 }]}>Família</Text>
                    <View style={[styles.checkbox, acconpanyingType === "Family" && styles.checkboxSelected, { marginLeft: 12 }]}>
                      {acconpanyingType === "Family" && <Text style={styles.checkboxText}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.contactOption,
                      acconpanyingType === "Friends" && styles.contactOptionSelected,
                      { paddingHorizontal: 16, paddingVertical: 12 }
                    ]}
                    onPress={() => handleAccompanying("Friends")}
                  >
                    <Text style={[styles.contactOptionTitle, { fontSize: 16, flex: 1 }]}>Amigos</Text>
                    <View style={[styles.checkbox, acconpanyingType === "Friends" && styles.checkboxSelected, { marginLeft: 12 }]}>
                      {acconpanyingType === "Friends" && <Text style={styles.checkboxText}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Qual estilo de viagem você prefere?</Text>
                <View style={{ flexDirection: 'column', gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.contactOption,
                      tripStyle.includes("Urban") && styles.contactOptionSelected
                    ]}
                    onPress={() => handleTripStyle("Urban")}
                  >
                    <Text style={[styles.contactOptionTitle, { fontSize: 16 }]}>Urbana</Text>
                    <View style={[styles.checkbox, tripStyle.includes("Urban") && styles.checkboxSelected]}>
                      {tripStyle.includes("Urban") && <Text style={styles.checkboxText}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.contactOption,
                      tripStyle.includes("Countryside") && styles.contactOptionSelected
                    ]}
                    onPress={() => handleTripStyle("Countryside")}
                  >
                    <Text style={[styles.contactOptionTitle, { fontSize: 16 }]}>Rural</Text>
                    <View style={[styles.checkbox, tripStyle.includes("Countryside") && styles.checkboxSelected]}>
                      {tripStyle.includes("Countryside") && <Text style={styles.checkboxText}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.contactOption,
                      (tripStyle.includes("Urban") && tripStyle.includes("Countryside")) && styles.contactOptionSelected
                    ]}
                    onPress={() => handleTripStyle("Both")}
                  >
                    <Text style={[styles.contactOptionTitle, { fontSize: 16 }]}>Ambos</Text>
                    <View style={[styles.checkbox, (tripStyle.includes("Urban") && tripStyle.includes("Countryside")) && styles.checkboxSelected]}>
                      {(tripStyle.includes("Urban") && tripStyle.includes("Countryside")) && <Text style={styles.checkboxText}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Método de locomoção preferido? (máximo 5)</Text>
                <View style={{ flexDirection: 'column', gap: 8 }}>
                  {(["Car", "Motorcycle", "Foot", "Train", "Boat", "Bicycle"] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.contactOption,
                        locomotionMethod.includes(type) && styles.contactOptionSelected,
                        locomotionMethod.length >= 5 && !locomotionMethod.includes(type) && { opacity: 0.5 }
                      ]}
                      onPress={() => handleLocomotion(type)}
                      disabled={locomotionMethod.length >= 5 && !locomotionMethod.includes(type)}
                    >
                      <Text style={[styles.contactOptionTitle, { fontSize: 16 }]}>
                        {getLocomotionLabel(type)}
                      </Text>
                      <View style={[styles.checkbox, locomotionMethod.includes(type) && styles.checkboxSelected]}>
                        {locomotionMethod.includes(type) && <Text style={styles.checkboxText}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Algum desejo especial para esta viagem?</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Eu gostaria de fazer algo específico nesta viagem..."
                  maxLength={100}
                  value={specialWish}
                  onChangeText={setSpecialWish}
                  placeholderTextColor="#9CA3AF"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Opções Avançadas</Text>
                <TouchableOpacity
                  style={[styles.contactOption, includeContacts && styles.contactOptionSelected]}
                  onPress={toggleContactSelection}
                >
                  <View style={styles.contactOptionContent}>
                    <Text style={styles.contactOptionTitle}>Incluir Contatos</Text>
                    <Text style={styles.contactOptionSubtitle}>
                      Compartilhar itinerário com amigos
                    </Text>
                  </View>
                  <View style={[styles.checkbox, includeContacts && styles.checkboxSelected]}>
                    {includeContacts && <Text style={styles.checkboxText}>✓</Text>}
                  </View>
                </TouchableOpacity>

                {includeContacts && listContacts && (
                  <View>
                    {selectedContacts.length > 0 && (
                      <View style={styles.selectedContactsContainer}>
                        <Text style={styles.sectionLabel}>
                          {selectedContacts.length} contato{selectedContacts.length > 1 ? 's' : ''} selecionado{selectedContacts.length > 1 ? 's' : ''}
                        </Text>
                        <View style={styles.selectedContactsRow}>
                          {selectedContacts.map((contact, index) => (
                            <View key={index} style={styles.selectedContactTag}>
                              <Text style={styles.selectedContactText}>
                                {contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Contato sem nome'}
                              </Text>
                              <TouchableOpacity 
                                onPress={() => handleContactSelection(contact)}
                                style={styles.removeContactButton}
                              >
                                <X size={14} color="#666" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    <Text style={styles.sectionLabel}>
                      {selectedContacts.length === 0 ? 'Selecione os contatos para compartilhar' : 'Seus contatos'}
                    </Text>
                    
                    {listContacts.length > 0 ? (
                      listContacts.map((data, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={[
                            styles.contactItem,
                            isContactSelected(data) && styles.contactItemSelected
                          ]}
                          onPress={() => handleContactSelection(data)}
                        >
                          <View style={styles.contactInfo}>
                            <Image 
                              source={ require('@assets/profile.png') } 
                              style={styles.contactImage}
                            />
                            <Text style={styles.contactName}>
                              {data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Contato sem nome'}
                            </Text>
                          </View>
                          <View style={[styles.checkbox, isContactSelected(data) && styles.checkboxSelected]}>
                            {isContactSelected(data) && <Text style={styles.checkboxText}>✓</Text>}
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.contactItem}>
                        <Text style={styles.contactName}>Nenhum contato disponível</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <View style={[styles.section, styles.lastSection]}>
                <Text style={styles.sectionLabel}>Informações Adicionais</Text>
                <Text style={styles.infoText}>
                  Qualquer ajuste manual nos destinos será automaticamente atualizado nos itinerários dos contatos selecionados.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
