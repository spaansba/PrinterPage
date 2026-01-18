import type { SubscriptionStatus } from "@/lib/schema/subscriptions";

export type Toaster = {
  id: string;
  name: string;
  profilePicture: string | null;
  toastsReceived: number;
  pairedAccounts: ToasterUser[];
  subscriptions: ToasterSubscription[];
};

export type SettingDefinition = {
  label: string;
  default: string;
  component: "string" | "number" | "boolean" | "select" | "time";
  selectOptions: string[] | null;
  userValue: string | null;
};

type ToasterSubscription = {
  subId: string;
  settings: Record<string, SettingDefinition>;
  sendTime: string | null;
  status: SubscriptionStatus;
  title: string;
  description: string;
};

export type tempUnit = "Celsius" | "Fahrenheit";

export type ToasterUser = {
  id: string;
  username: string;
  toastsSend: number;
  profileImageUrl?: string | null;
};

export type Friend = {
  printerId: string;
  name: string;
  lastSendMessage: string;
  profilePicture: string | null;
};

export type DBResult = {
  success: boolean;
  message: string;
};

export type DBResultToaster = DBResult & {
  data: Toaster;
};

export type DBResultUser = DBResult & {
  data: ToasterUser;
};
