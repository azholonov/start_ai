import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.SONNET_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const msg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      messages: [
        { role: "user", content: message }
      ],
    });

    const agentResponse = msg.content[0].type === 'text' ? msg.content[0].text : '';
    return NextResponse.json({ response: agentResponse });
  } catch (error) {
    console.error('Ошибка Anthropic API:', error);
    return NextResponse.json({ response: 'Ошибка сервера. Попробуйте позже.' }, { status: 500 });
  }
} 