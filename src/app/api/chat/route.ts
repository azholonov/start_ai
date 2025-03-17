import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_CONFIG } from '@/app/constants/anthropic';

interface RequestBody {
  message: string;
}

interface ResponseBody {
  thinking: string;
  plan: string;
}

const getThinkingPrompt = (message: string) => `
  The user has provided the following input about their goal: "${message}". 
  Before suggesting any plan or instructions, analyze and reflect on what the user might be aiming for, 
  what challenges they could face, and what considerations might be important. Do not suggest a plan yet, 
  just think about the goal. Give answer in language of the user.
`;

const getPlanPrompt = (thinkingResponse: string) => `
  Based on the following analysis of the user's goal: "${thinkingResponse}", 
  now create a detailed plan to help the user achieve their goal. Include specific steps, 
  considerations, and any relevant advice. Give answer in language of the user.
`;

const apiKey = process.env.SONNET_API_KEY;
if (!apiKey) {
  throw new Error('SONNET_API_KEY is not defined in environment variables');
}

const anthropic = new Anthropic({ apiKey });

export async function POST(request: Request) {
  try {
    const { message } = await request.json() as RequestBody;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const thinkingMsg = await anthropic.messages.create({
      model: ANTHROPIC_CONFIG.MODEL,
      max_tokens: ANTHROPIC_CONFIG.MAX_TOKENS_THINKING,
      messages: [
        { role: "user", content: getThinkingPrompt(message) }
      ],
    });

    const thinkingResponse = thinkingMsg.content[0].type === 'text' 
    ? thinkingMsg.content[0].text 
    : 'Unable to generate thinking response';

    const planMsg = await anthropic.messages.create({
      model: ANTHROPIC_CONFIG.MODEL,
      max_tokens: ANTHROPIC_CONFIG.MAX_TOKENS_PLAN,
      messages: [
        { role: "user", content: getPlanPrompt(thinkingResponse) }
      ],
    });

    const planResponse = planMsg.content[0].type === 'text' ? planMsg.content[0].text : '';

    // Return both responses to the user
    return NextResponse.json<ResponseBody>({
      thinking: thinkingResponse,
      plan: planResponse
    });
  } catch (error) {
    console.error('Ошибка Anthropic API:', error);
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}