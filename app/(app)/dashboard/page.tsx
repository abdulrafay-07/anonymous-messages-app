'use client'

import { Key, useCallback, useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios, { AxiosError } from "axios";

import { useSession } from "next-auth/react";
import { User } from "next-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MessageCard } from "@/components/message-card";
import { Loader2, RefreshCcw } from "lucide-react";

import { Message } from "@/models/user";
import { acceptMessageSchema } from "@/schemas/accept-message";
import { ApiResponse } from "@/types/api-response";

const Dashboard = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState(false);

    const { toast } = useToast();

    const { data: session } = useSession();

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema),
        defaultValues: {
            acceptMessages: true,
        },
    });
    const { register, watch, setValue } = form;
    const acceptMessages = watch("acceptMessages");

    // optimistic approach (update ui instantly before backend confirms the task has been done)
    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId));
    };

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true);
        try {
            const response = await axios.get<ApiResponse>("/api/accept-messages");
            if (response.data.success) {
                setValue("acceptMessages", response.data.isAcceptingMessages!);
            };
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch message acceptance status",
                variant: "destructive",
            });
        } finally {
            setIsSwitchLoading(false);
        };
    }, [setValue]);

    const fetchAllMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true);
        setIsSwitchLoading(false);
        try {
            const response = await axios.get<ApiResponse>("/api/get-messages");
            if (response.data.success) {
                setMessages(response.data.messages || []);
                if (refresh) {
                    toast({
                        title: "Refreshed messages",
                        description: "Showing the latest messages",
                    });
                };
            };
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch messages",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsSwitchLoading(false);
        };
    }, [setIsLoading, setMessages]);

    useEffect(() => {
        if (!session || !session.user) {
            return;
        };

        fetchAllMessages();
        fetchAcceptMessage();
    }, [session, setValue, fetchAcceptMessage, fetchAllMessages]);

    const toggleSwitch = async () => {
        try {
            const response = await axios.post<ApiResponse>("/api/accept-messages", {
                acceptMessages: !acceptMessages,
            });

            if (response.data.success) {
                setValue("acceptMessages", !acceptMessages);
                toast({
                    title: "Success",
                    description: response.data.message,
                });
            };
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to update switch",
                variant: "destructive",
            });
        };
    };

    if (!session || !session.user) {
        return <div>Sign in</div>;
    };

    const { username } = session?.user as User;
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${username}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);
        toast({
            title: "Success",
            description: "Copied to clipboard!",
        });
    };

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">
                    Copy Your Unique Link
                </h2>{' '}
                <div className="flex items-center">
                <Input
                    type="text"
                    value={profileUrl}
                    disabled
                    className="input input-bordered w-full p-2 mr-2"
                />
                <Button onClick={copyToClipboard}>Copy</Button>
            </div>
            <div className="mb-4 flex gap-2 items-center mt-2">
                <Switch
                    {...register("acceptMessages")}
                    checked={acceptMessages}
                    onCheckedChange={toggleSwitch}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />
            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchAllMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <RefreshCcw className="h-5 w-5" />
                )}
            </Button>
            <div className="mt-4 grid grid-colds-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <MessageCard
                            key={message._id as Key}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
        </div>
    )
};

export default Dashboard;