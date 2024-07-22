'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchMessages();

    const messageListener = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        setMessages(prevMessages => [...prevMessages, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageListener);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase.from('messages').select('*');
    if (error) console.log('Error fetching messages:', error.message);
    else setMessages(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && username.trim()) {
      const { data, error } = await supabase.from('messages').insert([{ message: newMessage, username }]);
      if (error) console.log('Error sending message:', error.message);
      else setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Real-Time Chat</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Enter your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={handleSubmit} className="bg-blue-500 text-white p-2">Send</button>
      </div>
      <ul>
        {messages.map((message) => (
          <li key={message.id} className="border-b p-2">
            <strong>{message.username}:</strong> {message.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
