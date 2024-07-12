import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";

import databaseConnect from "@/lib/db-connect";
import UserModel from "@/models/user";
import mongoose from "mongoose";

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

        const userId = new mongoose.Types.ObjectId(user._id);

        const userDetailsWithMessages = await UserModel.aggregate([
            { $match: {id: userId} },
            { $unwind: "$messages" },
            { $sort: {"messages.createdAt": -1} },
            { $group: {_id: "$_id", messages: {$push: "messages"}} },
        ]);

        if (!userDetailsWithMessages || userDetailsWithMessages.length === 0) {
            return Response.json({
                success: false,
                message: "User not found",
            }, {
                status: 401
            });
        };

        return Response.json({
            success: true,
            messages: userDetailsWithMessages[0].messages,
        }, {
            status: 200
        });
    } catch (error) {
        console.error("Error getting user messages", error);
        return Response.json({
            success: false,
            message: "Error getting user messages",
        }, {
            status: 500
        });  
    };
};