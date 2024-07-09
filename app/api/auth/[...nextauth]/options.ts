import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"

import databaseConnect from "@/lib/db-connect";
import UserModel from "@/models/user";

import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            // credentials generate a form on the sign in page
            // credentials.identifier.email || credentials.identifier.password
            credentials: {
                email: {
                    label: "Email", type: "email", placeholder: "tylerdurden@gmail.com",
                },
                password: {
                    label: "Password", type: "password",
                },
            },
            async authorize(credentials: any): Promise<any> {
                await databaseConnect();

                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier.email },
                            { password: credentials.identifier.password },
                        ]
                    });

                    if (!user) {
                        throw new Error("User not found with the following credentials");
                    };

                    if (!user.isVerified) {
                        throw new Error("Please verify your account first");
                    };

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error("Incorrect Password");
                    };
                } catch (error: any) {
                    throw new Error(error);
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            };

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            };

            return session;
        },
    },
    pages: {
        signIn: "/signin",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXT_AUTH_SECRET,
};