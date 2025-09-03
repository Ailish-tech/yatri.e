import { useState } from "react";
import {
  ScrollView,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions
} from "react-native";

import RNDateTimePicker from "@react-native-community/datetimepicker";

import { styles } from './styles/itineraryStyles';

import { continents, countries } from "./data/places";

import { X, Plus, Minus, ChevronDown } from "lucide-react-native";

type showAlertDialogTypes = {
  showAlertDialog: boolean,
  setShowAlertDialog: (show: boolean) => void
}

export function ItineraryCreateDialog({ showAlertDialog, setShowAlertDialog }: showAlertDialogTypes) {
  const [itineraryTitle, setItineraryTitle] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
  const [showDatePickers, setShowDatePickers] = useState<boolean>(false);
  const [days, setDays] = useState<number>(1);
  const [selectedContinent, setSelectedContinent] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [includeContacts, setIncludeContacts] = useState<boolean>(false);
  const [showContinentSelector, setShowContinentSelector] = useState<boolean>(false);
  const [showCountrySelector, setShowCountrySelector] = useState<boolean>(false);

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

  const selectContinent = (continent: string) => {
    setSelectedContinent(continent);
    setSelectedCountry("");
    setShowContinentSelector(false);
  };

  const selectCountry = (country: string) => {
    setSelectedCountry(country);
    setShowCountrySelector(false);
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
              <Text style={styles.headerTitle}>Criar Itinerário</Text>
              <TouchableOpacity style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Próximo</Text>
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
                <Text style={styles.sectionLabel}>Continente</Text>
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setShowContinentSelector(!showContinentSelector)}
                >
                  <Text style={[styles.selectorText, selectedContinent && styles.selectorTextSelected]}>
                    {selectedContinent || "Selecione um continente"}
                  </Text>
                  <ChevronDown size={16} color="#666" />
                </TouchableOpacity>

                {showContinentSelector && (
                  <View style={styles.dropdownContainer}>
                    <ScrollView style={styles.dropdown}>
                      {continents.map((continent) => (
                        <TouchableOpacity
                          key={continent}
                          style={styles.dropdownItem}
                          onPress={() => selectContinent(continent)}
                        >
                          <Text style={styles.dropdownItemText}>{continent}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {selectedContinent && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>País</Text>
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowCountrySelector(!showCountrySelector)}
                  >
                    <Text style={[styles.selectorText, selectedCountry && styles.selectorTextSelected]}>
                      {selectedCountry || "Selecione um país"}
                    </Text>
                    <ChevronDown size={16} color="#666" />
                  </TouchableOpacity>

                  {showCountrySelector && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.dropdown}>
                        {countries[selectedContinent as keyof typeof countries]?.map((country) => (
                          <TouchableOpacity
                            key={country}
                            style={styles.dropdownItem}
                            onPress={() => selectCountry(country)}
                          >
                            <Text style={styles.dropdownItemText}>{country}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Opções Avançadas</Text>
                <TouchableOpacity
                  style={[styles.contactOption, includeContacts && styles.contactOptionSelected]}
                  onPress={() => setIncludeContacts(!includeContacts)}
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
              </View>

              <View style={[styles.section, styles.lastSection]}>
                <Text style={styles.sectionLabel}>Informações Adicionais</Text>
                <Text style={styles.infoText}>
                  Qualquer ajuste manual nos destinos será automaticamente atualizado nos itinerários dos grupos selecionados.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}