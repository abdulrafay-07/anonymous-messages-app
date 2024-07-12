'use client'

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DeleteDialog } from "./delete-dialog";

import { MessageCardProps } from "@/types/message-card";

export const MessageCard = ({
    message,
    onMessageDelete,
}: MessageCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <DeleteDialog message={message} onMessageDelete={onMessageDelete} />
                <CardDescription>Card Description</CardDescription>
            </CardHeader>
        </Card>
    )
};