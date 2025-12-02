import { Modal, TouchableOpacity } from "react-native";

import { View, Text, Button, ButtonText } from "@gluestack-ui/themed";

import { CheckCircle2, X, Eye } from "lucide-react-native";

type ExpenseAddedModalProps = {
  visible: boolean;
  onClose: () => void;
  onViewExpenses: () => void;
  expenseTitle: string;
  expenseAmount: number;
};

export function ExpenseAddedModal({
  visible,
  onClose,
  onViewExpenses,
  expenseTitle,
  expenseAmount
}: ExpenseAddedModalProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Modal
      visible={ visible }
      transparent
      animationType="fade"
      onRequestClose={ onClose }
    >
      <View flex={1} bgColor="rgba(0, 0, 0, 0.5)" justifyContent="center" alignItems="center">
        <View
          bgColor="#FFF"
          borderRadius={25}
          p={25}
          width="85%"
          maxWidth={400}
        >
          <TouchableOpacity
            onPress={ onClose }
            style={{ position: 'absolute', top: 15, right: 15, zIndex: 10 }}
          >
            <X size={24} color="#666" />
          </TouchableOpacity>

          <View alignItems="center" mt={10} mb={20}>
            <View bgColor="#10B98115" p={15} borderRadius={50} mb={15}>
              <CheckCircle2 size={50} color="#10B981" />
            </View>
            <Text fontSize="$xl" fontWeight="$bold" color="#000" textAlign="center">
              Gasto Adicionado
            </Text>
          </View>

          <View bgColor="#F8F8F8" p={15} borderRadius={15} mb={20}>
            <Text fontSize="$sm" color="#666" mb={5}>
              { expenseTitle }
            </Text>
            <Text fontSize="$2xl" fontWeight="$bold" color="#2752B7">
              { formatCurrency(expenseAmount) }
            </Text>
          </View>

          <View gap={10}>
            <Button
              bgColor="#2752B7"
              borderRadius={12}
              onPress={onViewExpenses}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
            >
              <Eye size={20} color="#FFF" style={{ marginRight: 8 }} />
              <ButtonText color="#FFF" fontWeight="$semibold">Ver Todos os Gastos</ButtonText>
            </Button>

            <Button
              bgColor="#F0F0F0"
              borderRadius={12}
              onPress={onClose}
            >
              <ButtonText color="#666" fontWeight="$semibold">Continuar no Roteiro</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}