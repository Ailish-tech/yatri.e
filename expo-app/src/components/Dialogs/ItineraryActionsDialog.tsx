import { 
  AlertDialog, 
  AlertDialogBackdrop, 
  AlertDialogBody, 
  AlertDialogContent,
  AlertDialogHeader,
  Button, 
  ButtonIcon,
  ButtonText,
  Text,
  View,
  Pressable
} from "@gluestack-ui/themed";

import { X, Edit, Trash2, ArrowRightLeft } from "lucide-react-native";

type ItineraryActionsDialogProps = {
  showAlertDialog: boolean;
  currentStatus: "Planejado" | "Rascunho" | "Passado";
  handleClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: () => void;
};

export function ItineraryActionsDialog({ 
  showAlertDialog, 
  currentStatus,
  handleClose, 
  onEdit,
  onDelete,
  onMove
}: ItineraryActionsDialogProps) {
  
  const getMoveText = () => {
    if (currentStatus === "Planejado") {
      return "Mover para Rascunhos";
    } else if (currentStatus === "Rascunho") {
      return "Mover para Planejados";
    }
    return "Mover";
  };

  const getMoveDescription = () => {
    if (currentStatus === "Planejado") {
      return "Salvar como rascunho para edição posterior";
    } else if (currentStatus === "Rascunho") {
      return "Confirmar planejamento do roteiro";
    }
    return "Alterar status";
  };

  return (
    <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size="md">
      <AlertDialogBackdrop bg="rgba(0, 0, 0, 0.6)" />
      <AlertDialogContent 
        bgColor="$white" 
        borderRadius={24}
        overflow="hidden"
        sx={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {/* Header */}
        <AlertDialogHeader 
          borderBottomWidth={0}
          px={24}
          pt={24}
          pb={20}
          bgColor="#2752B7"
          flexDirection="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <View flex={1} gap={4}>
            <Text fontSize={26} fontWeight="$bold" color="white">
              Gerenciar Roteiro
            </Text>
            <Text fontSize={14} color="rgba(255, 255, 255, 0.85)">
              Escolha uma ação para continuar
            </Text>
          </View>
          <Pressable 
            onPress={handleClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} color="#FFF" strokeWidth={2.5} />
          </Pressable>
        </AlertDialogHeader>
        
        <AlertDialogBody px={24} py={24}>
          <View gap={14}>
            {/* Botão Editar */}
            <Pressable
              onPress={() => {
                onEdit();
                handleClose();
              }}
            >
              {({ pressed }) => (
                <View
                  bgColor={pressed ? "#F8F9FA" : "#FFFFFF"}
                  borderRadius={16}
                  flexDirection="row"
                  alignItems="center"
                  gap={16}
                  p={18}
                  borderWidth={2}
                  borderColor={pressed ? "#2752B7" : "#E8EAF0"}
                  sx={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View 
                    bgColor="#2752B7" 
                    p={12} 
                    borderRadius={14}
                    sx={{
                      shadowColor: "#2752B7",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Edit size={22} color="#FFF" strokeWidth={2.5} />
                  </View>
                  <View flex={1} gap={4}>
                    <Text color="#1F2937" fontSize={16} fontWeight="$bold">
                      Editar Roteiro
                    </Text>
                    <Text fontSize={13} color="#6B7280">
                      Modificar detalhes, datas e atividades
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>

            {/* Botão Mover */}
            {currentStatus !== "Passado" && (
              <Pressable
                onPress={() => {
                  onMove();
                  handleClose();
                }}
              >
                {({ pressed }) => (
                  <View
                    bgColor={pressed ? "#F8F9FA" : "#FFFFFF"}
                    borderRadius={16}
                    flexDirection="row"
                    alignItems="center"
                    gap={16}
                    p={18}
                    borderWidth={2}
                    borderColor={pressed ? "#3B82F6" : "#E8EAF0"}
                    sx={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View 
                      bgColor="#3B82F6" 
                      p={12} 
                      borderRadius={14}
                      sx={{
                        shadowColor: "#3B82F6",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <ArrowRightLeft size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <View flex={1} gap={4}>
                      <Text color="#1F2937" fontSize={16} fontWeight="$bold">
                        {getMoveText()}
                      </Text>
                      <Text fontSize={13} color="#6B7280">
                        {getMoveDescription()}
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            )}

            {/* Separador visual */}
            <View height={1} bgColor="#E8EAF0" my={6} />

            {/* Botão Excluir */}
            <Pressable
              onPress={() => {
                onDelete();
                handleClose();
              }}
            >
              {({ pressed }) => (
                <View
                  bgColor={pressed ? "#FEF2F2" : "#FFF5F5"}
                  borderRadius={16}
                  flexDirection="row"
                  alignItems="center"
                  gap={16}
                  p={18}
                  borderWidth={2}
                  borderColor={pressed ? "#DC2626" : "#FECACA"}
                  sx={{
                    shadowColor: "#DC2626",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View 
                    bgColor="#DC2626" 
                    p={12} 
                    borderRadius={14}
                    sx={{
                      shadowColor: "#DC2626",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Trash2 size={22} color="#FFF" strokeWidth={2.5} />
                  </View>
                  <View flex={1} gap={4}>
                    <Text color="#DC2626" fontSize={16} fontWeight="$bold">
                      Excluir Roteiro
                    </Text>
                    <Text fontSize={13} color="#991B1B">
                      Ação permanente e irreversível
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
          </View>
        </AlertDialogBody>
      </AlertDialogContent>
    </AlertDialog>
  );
}
