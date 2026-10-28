export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export type ChatTurn = Pick<Message, "role" | "content">;

export interface Conversation {
  id: string;
  title: string;
  topicId?: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export type View = "home" | "tutor" | "library" | "progress" | "history";

export interface Health {
  configured: boolean;
  model?: string;
}

export type ApiStatus = "checking" | "online" | "unconfigured" | "offline";
