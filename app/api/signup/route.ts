import databaseConnect from "@/lib/db-connect";
import UserModel from "@/models/user";
import { sendVerificationMail } from "@/helpers/send-verification-email";

import { NextRequest } from "next/server";

import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    if (request.method !== "POST") {
        return Response.json({
            status: false,
            message: "Other requests than POST are not allowed"
        }, {
            status: 405
        });
    };

    await databaseConnect();

    try {
        const { username, email, password } = await request.json();

        const existingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiedUserByUsername) {
            return Response.json({
                success: false,
                message: "Username already exists",
            }, { status: 400 });
        };

        const existingUserByEmail = await UserModel.findOne({ email });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists with this email",
                }, { status: 400 });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = otp;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

                await existingUserByEmail.save();
            };
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode: otp,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            });

            await newUser.save();
        };

        // send verification email
        const emailResponse = await sendVerificationMail(
            email,
            username,
            otp,
        );

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message,
            }, { status: 500 });
        };

        return Response.json({
            success: true,
            message: "User registered successfully. Please verify your account.",
        }, { status: 201 });
    } catch (error) {
        console.error("Error registering user", error);
        return Response.json({
            success: false,
            message: "Error registering user",
        }, {
            status: 500
        });
    };
};