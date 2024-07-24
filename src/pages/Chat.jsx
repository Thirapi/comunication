import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        if (payload.eventType === 'INSERT') {
          setMessages(prevMessages => [...prevMessages, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users (
          username
        )
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages', error);
    } else {
      setMessages(data);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const user = supabase.auth.user();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const { error } = await supabase.from('messages').insert([
      { content: message, user_id: user.id }
    ]);

    if (error) {
      console.error('Error sending message', error);
    } else {
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map(msg => (
          <div key={msg.id} className="mb-2 p-2 bg-white rounded shadow">
            <div className="text-sm text-gray-700">{msg.users.username}</div>
            <div className="text-md">{msg.content}</div>
            <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          className="flex-1 px-3 py-2 border rounded-lg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2">Send</button>
      </form>
    </div>
  );
};

export default Chat;
