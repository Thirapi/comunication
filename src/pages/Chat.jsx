import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useNavigate } from 'react-router-dom';
import image from '/src/assets/image.png';
import dayjs from 'dayjs';
import { FiCornerUpLeft, FiSend, FiCornerDownRight } from "react-icons/fi";

// Debounce helper
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    setToken(storedToken);
    setUsername(storedUsername);

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
    channel.bind('message', debounce((data) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, data];
        return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    }, 300)); // Added debounce to avoid too many updates at once

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  // Optimized scroll handler
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Memoized message list to avoid unnecessary re-renders
  const memoizedMessages = useMemo(() => {
    return messages.map((msg) => (
      <div key={msg.id} className="mb-1 p-2 rounded transition-colors duration-200 hover:bg-slate-900">
        <div className="flex items-center mb-1">
          <strong className="mr-2">{msg.username}</strong>
          <span className="text-gray-500 text-sm">{dayjs(msg.created_at).format('DD/MM/YYYY h:mm A')}</span>
          <button onClick={() => handleReply(msg)} className="text-sm text-white flex items-center">
            <FiCornerUpLeft className="ml-2" /> balas
          </button>
        </div>
        {msg.reply_to_message && (
          <div className="py-1 rounded mb-2 text-sm flex items-center" style={{ backgroundColor: '#1E1E1E' }}>
            <FiCornerDownRight className="mr-2" />
            <strong className="mr-1">{msg.reply_to_username}:</strong>
            <span>{msg.reply_to_message}</span>
          </div>
        )}
        <div>{msg.message}</div>
      </div>
    ));
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/messages`, { 
        message, 
        replyTo: replyTo ? replyTo.id : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newMessage = response.data;

      // Reset input and replyTo after sending message
      setMessage('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Navigate to login or home page after logout
  };

  const handleReply = (msg) => {
    setReplyTo(msg); // Set reply-to message
  };

  const handleCancelReply = () => {
    setReplyTo(null); // Cancel reply
  };

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{
        backgroundColor: '#0A0A0A',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed'
      }}>
      <div className="text-white shadow-md w-full mx-auto max-w-4xl border-solid border-slate-600 border-2 shadow-lg flex flex-col"
        style={{
          backgroundColor: '#181818',
          borderTop: 'none',
          borderRadius: '0 0 40px 40px',
          height: '100vh',
          padding: '0 2rem 1rem 2rem'
        }}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 mb-4"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}>
            {memoizedMessages}
            <div ref={messageEndRef} />
          </div>
        </div>
        {replyTo && (
          <div className="bg-slate-700 p-2 mb-2 rounded text-sm">
            Membalas <strong>{replyTo.username}</strong>: {replyTo.message}
            <button onClick={handleCancelReply} className="text-sm text-red-400 hover:underline ml-2">
              Batalkan
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full mx-auto max-w-4xl flex items-center p-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow px-4 py-2 text-black border rounded-full mr-2"
            placeholder="Type your message..."
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-3 rounded-full">
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
