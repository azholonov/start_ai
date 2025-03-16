import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.SONNET_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Step 1: Generate the "thinking" response
    const thinkingPrompt = `The user has provided the following input about their goal: "${message}". 
    Before suggesting any plan or instructions, analyze and reflect on what the user might be aiming for, 
    what challenges they could face, and what considerations might be important. Do not suggest a plan yet, 
    just think about the goal. Give answer in language of the user.`;

    const thinkingMsg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 500,
      messages: [
        { role: "user", content: thinkingPrompt }
      ],
    });

    const thinkingResponse = thinkingMsg.content[0].type === 'text' ? thinkingMsg.content[0].text : '';

    // Step 2: Generate the plan based on the thinking response
    const planPrompt = `Based on the following analysis of the user's goal: "${thinkingResponse}", 
    now create a detailed plan to help the user achieve their goal. Include specific steps, 
    considerations, and any relevant advice. . Give answer in language of the user.`;

    const planMsg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      messages: [
        { role: "user", content: planPrompt }
      ],
    });

    const planResponse = planMsg.content[0].type === 'text' ? planMsg.content[0].text : '';

    // Return both responses to the user
    return NextResponse.json({
      thinking: thinkingResponse,
      plan: planResponse
    });
  } catch (error) {
    console.error('Ошибка Anthropic API:', error);
    return NextResponse.json({ response: 'Ошибка сервера. Попробуйте позже.' }, { status: 500 });
  }
}