import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages`);
        // Ensure messages are in the correct order (newest first)
        setMessages(response.data.reverse()); // Reverse the order if needed
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Setup Pusher
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe('chat');
    channel.bind('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat container
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/messages`, { userId, message });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg my-8 h-[calc(100vh-4rem)] flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Chat</h1>
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
