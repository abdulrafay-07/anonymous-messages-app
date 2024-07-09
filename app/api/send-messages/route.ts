import { NextRequest } from "next/server";

import databaseConnect from "@/lib/db-connect";
import UserModel from "@/models/user";

import { Message } from "@/models/user";

export async function POST(request: NextRequest) {
    await databaseConnect();
    
    try {
        const { username, content }  = await request.json();

        const user = await UserModel.findOne({
            username,
        });

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found",
            }, {
                status: 404
            });
        };

        // Check if the user is accepting messages
        if (!user.isAcceptingMessages) {
            return Response.json({
                success: false,
                message: "User is not accepting messages",
            }, {
                status: 403
            });
        };

        const newMessage = {
            content,
            createdAt: new Date(),
        };

        user.messages.push(newMessage as Message);

        await user.save();

        return Response.json({
            success: true,
            message: "Message sent successfully",
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Error sending the message", error);
        return Response.json({
            success: false,
            message: "Error sending the message",
        }, {
            status: 500
        });
    }
};