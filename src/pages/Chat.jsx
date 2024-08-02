import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
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
    // Scroll to the bottom of the messages
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/messages`,
        { message },
        { withCredentials: true }
      );
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-scroll p-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4">
            <div className="font-bold">{msg.username}</div>
            <div>{msg.message}</div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-200">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
          placeholder="Type a message"
        />
        <button type="submit" className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
