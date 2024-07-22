// pages/api/messages.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('messages').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const { message, username } = req.body;
    const { data, error } = await supabase.from('messages').insert([{ message, username }]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
  }
}
