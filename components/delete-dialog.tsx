import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

import { MessageCardProps } from "@/types/message-card";
import { ApiResponse } from "@/types/api-response";

import axios from "axios";

export const DeleteDialog = ({
    message,
    onMessageDelete,
}: MessageCardProps) => {
    const { toast } = useToast();

    const handleDelete = async () => {
        const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`);

        if (response.data.success) {
            toast({
                title: "Success",
                description: "Message deleted Successfully",
            });
        } else {
            toast({
                title: "Error",
                description: "Failed to delete the message",
                variant: "destructive"
            });
        };
        onMessageDelete(message._id as string);
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <X />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the relevant data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
};