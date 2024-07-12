import { NextRequest } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

import databaseConnect from "@/lib/db-connect";
import UserModel from "@/models/user";

interface Props {
    messageId: string;
};

export async function DELETE(request: NextRequest, params: Props) {
    const messageId = params.messageId;

    await databaseConnect();

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

    try {
        const updatedResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: {_id: messageId} } },
        );

        if (updatedResult.modifiedCount === 0) {
            return Response.json({
                success: false,
                message: "Message not found",
            }, {
                status: 404
            });
        };

        return Response.json({
            success: true,
            message: "Message deleted",
        }, {
            status: 200
        });
    } catch (error) {
        console.error("Error deleting the message", error);
        return Response.json({
            success: false,
            message: "Error deleting the message",
        }, {
            status: 500
        });
    };
};