import databaseConnect from "@/lib/db-connect";
import UserModel from "@/models/user";

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    await databaseConnect();

    try {
        const { username, otp } = await request.json();

        // decoding username just in case it has white space (URL converts whitespace to %20)
        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found",
            }, {
                status: 400
            });
        };

        const isCodeValid = user.verifyCode === otp;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return Response.json({
                success: true,
                message: "Account verified",
            }, {
                status: 200
            });
        };

        if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification code is expired",
            }, {
                status: 400
            });
        } else {
            return Response.json({
                success: false,
                message: "Verification code is incorrect",
            }, {
                status: 400
            });
        };
    } catch (error) {
        console.error("Error verifying user", error);
        return Response.json({
            success: false,
            message: "Error verifying user",
        }, {
            status: 500
        });  
    };
};