export interface Message {
  role: "user" | "assistant";
  content: string;
  created_at: Date;
  files?: File[];
  done?: boolean;
  model?: string;
}
