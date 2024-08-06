import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useNavigate } from 'react-router-dom';
import image from '/src/assets/image.png';
import dayjs from 'dayjs';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null); // Tambahkan state untuk username
  const messageEndRef = useRef(null);
  const navigate = useNavigate(); // Use navigate hook

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

      // Hapus penambahan duplikat pesan secara lokal
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Navigate to login or home page after logout
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-900"
    style={{
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="bg-slate-800 text-white rounded shadow-md p-8 w-full max-w-lg my-8 h-[calc(100vh-4rem)] border-solid border-slate-300 border-2 shadow-lg rounded-md flex flex-col">
        <div className="flex justify-between items-center mb-6 text-white">
          <h1 className="text-2xl font-bold">Komunikasi</h1>
          <button
            onClick={handleLogout}
            className="text-rose-800 py-2 px-4 border border-rose-800 rounded-md hover:bg-rose-800 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="overflow-y-auto flex-1 mb-4">
          {/* {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <strong>{msg.username}</strong>: {msg.message}
            </div>
          ))} */}
          {messages.map((msg) => (
            <div key={msg.id} className="mb-4">
              <div className="flex items-center mb-1">
                <strong className="mr-2">{msg.username}</strong>
                <span className="text-gray-500 text-sm">{dayjs(msg.created_at).format('DD/MM/YYYY h:mm A')}</span>
              </div>
              <div>{msg.message}</div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 text-black border rounded-md mb-2"
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
