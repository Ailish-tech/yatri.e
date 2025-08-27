import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogFooter, 
  AlertDialogBody, 
  AlertDialogBackdrop,
  Button,
  ButtonText,
  Heading,
  Text
} from "@gluestack-ui/themed";

type showAlertDialogTypes = {
  showAlertDialog: boolean,
  setShowAlertDialog: (show: boolean) => void
}

export function ItineraryCreateDialog({ showAlertDialog, setShowAlertDialog }: showAlertDialogTypes) {
  const handleClose = () => setShowAlertDialog(false);

  return (
    <>
      <AlertDialog
        isOpen={ showAlertDialog }
        onClose={ handleClose }
        size="md"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading fontWeight="$font-semibold" size="md">
              Are you sure you want to delete this post?
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody mt={3} mb={4}>
            <Text size="sm">
              Deleting the post will remove it permanently and cannot be undone. Please confirm if you want to proceed.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={ handleClose }
              size="sm"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button size="sm" onPress={ handleClose }>
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}