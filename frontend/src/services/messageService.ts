import { supabase } from '../lib/supabase';
import type { Message, MessageParticipant, MessageThread } from '../types';

const DEFAULT_LOCAL_BACKEND = 'http://localhost:8001';
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const isLocalhost =
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_URL = RAW_BACKEND_URL || (isLocalhost ? DEFAULT_LOCAL_BACKEND : '');

export const getMyThreads = async (): Promise<Array<{ participant: MessageParticipant; thread: MessageThread }>> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('message_participants')
    .select('thread_id,user_id,role,last_read_at,created_at,thread:message_threads(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    participant: {
      thread_id: row.thread_id,
      user_id: row.user_id,
      role: row.role,
      last_read_at: row.last_read_at,
      created_at: row.created_at,
    },
    thread: row.thread,
  }));
};

export const getThreadMessages = async (threadId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(300);

  if (error) throw error;
  return data || [];
};

export const sendMessage = async (threadId: string, body: string): Promise<Message> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  if (!userId) throw new Error('No auth session.');

  const payload = {
    thread_id: threadId,
    sender_user_id: userId,
    body: body.trim(),
  };

  const { data, error } = await supabase.from('messages').insert([payload]).select().single();
  if (error) throw error;
  return data;
};

export const markThreadRead = async (threadId: string): Promise<void> => {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  if (!userId) return;

  const { error } = await supabase
    .from('message_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('thread_id', threadId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const startThread = async (params: {
  recipientEmail: string;
  subject?: string;
  message?: string;
}): Promise<{ threadId: string }> => {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error('No auth session.');

  const response = await fetch(`${BACKEND_URL}/api/messages/start-thread`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to start thread (${response.status}) ${text}`);
  }

  return JSON.parse(text);
};

