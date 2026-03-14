import { LucideIcon } from "lucide-react-native";

export type NotificationType = 'general' | 'safety' | 'crowd' | 'emergency';
export type NotificationSeverity = 'info' | 'warning' | 'danger' | 'critical';

export interface NotificationsTypes {
  id: number,
  title: string,
  description: string,
  routeIcon: LucideIcon,
  type?: NotificationType,
  severity?: NotificationSeverity,
}