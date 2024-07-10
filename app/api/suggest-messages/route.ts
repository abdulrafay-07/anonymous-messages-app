import { google } from '@ai-sdk/google';
import { streamText } from "ai";

const model = google("models/gemini-1.5-flash-latest");

export async function POST(request: Request) {
    try {
        const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
    
        const response = await streamText({
            model,
            prompt,
        });

        return response.toAIStreamResponse();
    } catch (error) {
        if (error) {
            console.error("Error suggesting messages", error);
            return Response.json({
                success: false,
                message: "Error suggesting messages",
            }, {
                status: 500
            });  
        } else {
            console.error("An unexpected error occured.");
            throw Error();
        };
    };
};