import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Функция для получения клиента Supabase с токеном
export const getSupabaseWithToken = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('supabase_token') : null;
  
  if (!token) {
    return supabase;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  sender: 'user' | 'agent';
  type?: 'thinking' | 'plan';
  created_at: string;
}

// Создание нового чата
export async function createChat(title: string): Promise<Chat | null> {
  const supabaseWithToken = getSupabaseWithToken();
  const user = await supabaseWithToken.auth.getUser();
  if (!user.data.user) return null;

  const { data, error } = await supabaseWithToken
    .from('chats')
    .insert([
      { 
        title, 
        user_id: user.data.user.id 
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating chat:', error);
    return null;
  }

  return data;
}

// Получение всех чатов пользователя
export async function getUserChats(): Promise<Chat[]> {
  const supabaseWithToken = getSupabaseWithToken();
  
  const { data, error } = await supabaseWithToken
    .from('chats')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    return [];
  }

  return data || [];
}

// Получение чата по ID
export async function getChatById(chatId: string): Promise<Chat | null> {
  const supabaseWithToken = getSupabaseWithToken();
  
  const { data, error } = await supabaseWithToken
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();

  if (error) {
    console.error('Error fetching chat:', error);
    return null;
  }

  return data;
}

// Обновление заголовка чата
export async function updateChatTitle(chatId: string, title: string): Promise<boolean> {
  const supabaseWithToken = getSupabaseWithToken();
  
  const { error } = await supabaseWithToken
    .from('chats')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', chatId);

  if (error) {
    console.error('Error updating chat title:', error);
    return false;
  }

  return true;
}

// Удаление чата
export async function deleteChat(chatId: string): Promise<boolean> {
  const supabaseWithToken = getSupabaseWithToken();
  
  const { error } = await supabaseWithToken
    .from('chats')
    .delete()
    .eq('id', chatId);

  if (error) {
    console.error('Error deleting chat:', error);
    return false;
  }

  return true;
}

// Добавление сообщения в чат
export async function addMessage(
  chatId: string,
  content: string,
  sender: 'user' | 'agent', type?: 'thinking' | 'plan',
): Promise<Message | null> {
  const supabaseWithToken = getSupabaseWithToken();
  
  const { data, error } = await supabaseWithToken
    .from('messages')
    .insert([
      { chat_id: chatId, content, sender, type }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    return null;
  }

  // Обновляем время последнего сообщения в чате
  await supabaseWithToken
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId);

  return data;
}

// Получение всех сообщений чата
export async function getChatMessages(chatId: string): Promise<Message[]> {
  const supabaseWithToken = getSupabaseWithToken();
  
  const { data, error } = await supabaseWithToken
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}