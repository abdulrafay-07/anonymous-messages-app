import databaseConnect from "@/lib/db-connect";
import UserModel from "@/models/user";

import { NextRequest } from "next/server";

import { z } from "zod";
import { usernameValidation } from "@/schemas/signup";

const usernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: NextRequest) {
    if (request.method !== "GET") {
        return Response.json({
            status: false,
            message: "Other requests than GET are not allowed"
        }, {
            status: 405
        });
    };
    
    await databaseConnect();

    try {
        const { searchParams } = new URL(request.url);

        const queryParam = {
            username: searchParams.get("username"),
        };

        // zod validation

        const result = usernameQuerySchema.safeParse(queryParam);

        console.log(result); //TODO: remove

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];

            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters",
            }, {
                status: 400 
            });
        };

        const { username } = result.data;

        const existingVerifiedUsername = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken",
            }, {
                status: 500
            });
        };

        return Response.json({
            success: true,
            message: "Username is unique",
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Error checking for unique username", error);
        return Response.json({
            success: false,
            message: "Error registering user",
        }, {
            status: 500
        });
    };
};