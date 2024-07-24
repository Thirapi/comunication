import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      setMessages(data);
    };

    const subscription = supabase
      .channel('realtime messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    fetchMessages();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleSend = async () => {
    if (input.trim()) {
      const { error } = await supabase.from('messages').insert([{ content: input, user_id: supabase.auth.user().id }]);
      if (error) console.error(error);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-200">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className="bg-white p-2 my-2 rounded shadow">
            {msg.content}
          </div>
        ))}
      </div>
      <div className="p-4 bg-white flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;