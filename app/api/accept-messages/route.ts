import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";

import databaseConnect from "@/lib/db-connect";
import UserModel from "@/models/user";

export async function POST(request: NextRequest) {
    await databaseConnect();

    try {
        const session = await getServerSession(authOptions);
        const user = session?.user;

        if (!session || !user) {
            return Response.json({
                success: false,
                message: "Not Authenticated.",
            }, {
                status: 401
            });
        };

        const userId = user._id;
        
        const { acceptMessages } = await request.json();

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            // new: true returns updated value
            { new: true },
        );

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Failed to update user",
            }, {
                status: 401
            });
        };

        return Response.json({
            success: true,
            message: "Updated message acceptance status successfully",
            updatedUser,
        }, {
            status: 200
        });
    } catch (error) {
        console.error("Error updating user status to accept messages", error);
        return Response.json({
            success: false,
            message: "Error changing accept messages request",
        }, {
            status: 500
        });
    };
};

export async function GET() {
    await databaseConnect();

    try {
        const session = await getServerSession(authOptions);
        const user = session?.user;

        if (!session || !user) {
            return Response.json({
                success: false,
                message: "Not Authenticated.",
            }, {
                status: 401
            });
        };

        const userId = user._id;

        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found",
            }, {
                status: 401
            });
        };

        return Response.json({
            success: true,
            message: "User found with message acceptance status",
            isAcceptingMessages: foundUser.isAcceptingMessages,
        }, {
            status: 200
        });
    } catch (error) {
        console.error("Error getting user acceptance messages details", error);
        return Response.json({
            success: false,
            message: "Error getting user acceptance messages details",
        }, {
            status: 500
        });
    };
};