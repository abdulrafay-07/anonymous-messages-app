import { resend } from "@/lib/resend";

import VerificationEmail from "@/emails/verification-email";
import { ApiResponse } from "@/types/api-response";

export async function sendVerificationMail(
    username: string,
    email: string,
    otp: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Anonymous Message - Verification Code",
            react: VerificationEmail({username, otp}),
        });

        return {
            success: true,
            message: "Verification email sent successfully",
        };
    } catch (error) {
        console.error("Error occurred while sending verification email", error);

        return {
            success: false,
            message: "Failed to send verification email",
        };
    };
};