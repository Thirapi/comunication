import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null); // Tambahkan state untuk username
  const messageEndRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username'); // Ambil username dari localStorage

    setToken(storedToken);
    setUsername(storedUsername); // Set username

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const sortedMessages = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe('chat');
    channel.bind('message', (data) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, data];
        return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/messages`, { message }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newMessage = response.data;

      // Tambahkan pesan ke state secara lokal
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg my-8 h-[calc(100vh-4rem)] flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Chat🗨</h1>
        <div className="overflow-y-auto flex-1 mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <strong>{msg.username}</strong>: {msg.message}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border rounded-md mb-2"
            placeholder="Type your message..."
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
