import { Message } from "@/models/user";

export interface MessageCardProps {
    message: Message;
    onMessageDelete: (messageId: string) => void;
};