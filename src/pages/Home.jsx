import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages`);
      setMessages(response.data);
    };

    fetchMessages();

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true
    });

    const channel = pusher.subscribe('chat');
    channel.bind('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      pusher.unsubscribe('chat');
    };
  }, []);

  const sendMessage = async () => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/messages`, { message, userId: 1 });
    setMessage('');
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="border p-2 w-full" />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2 mt-2">Send</button>
      </div>
      <div>
        {messages.map((msg) => (
          <div key={msg.id} className="p-2 border-b">
            <strong>{msg.username}: </strong> {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
