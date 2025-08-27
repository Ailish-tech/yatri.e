import {
  Button,
  ButtonGroup,
  ButtonText
} from "@gluestack-ui/themed";

import { LucideIcon } from "lucide-react-native";

type ButtonContent = {
  textContent: string,
  icon: LucideIcon,
  action: () => void,
  iconDimension: number,
  textColor: string,
  buttonSize?: "xs" | "sm" | "md" | "lg" | "xl" | undefined,
  iconStyles?: Object,
  buttonStyles?: Object,
  styles?: Object
}

export function ButtonIconLeft({ textContent, buttonSize, icon: Icon, iconDimension, textColor, action, iconStyles, buttonStyles, styles }: ButtonContent){
  return(
    <ButtonGroup alignContent="center" style={ styles }>
      <Button variant="link" onPress={ action } px={10} size={ buttonSize } justifyContent="center" alignItems="center" style={ buttonStyles }>
        <Icon width={ iconDimension } height={ iconDimension } style={ iconStyles } />
        <ButtonText color={ textColor } size="lg">{ textContent }</ButtonText>
      </Button>
    </ButtonGroup>
  )
}