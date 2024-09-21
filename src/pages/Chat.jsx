import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useNavigate } from 'react-router-dom';
import image from '/src/assets/image.png';
import dayjs from 'dayjs';
import { FiCornerUpLeft, FiSend, FiCornerDownRight } from "react-icons/fi";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null); // State untuk pesan yang dibalas
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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/messages`, { 
        message, 
        replyTo: replyTo ? replyTo.id : null  // Kirim ID pesan yang sedang dibalas, jika ada
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newMessage = response.data;

      // Reset input dan replyTo setelah mengirim pesan
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
    setReplyTo(msg); // Set pesan yang sedang dibalas
  };

  const handleCancelReply = () => {
    setReplyTo(null); // Batalkan balasan
  };

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{
        backgroundColor: '#0A0A0A',
        // backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed'
      }}>
      <div className="text-white rounded shadow-md p-8 w-full mx-auto max-w-4xl h-[calc(100vh-4rem)] border-solid border-slate-600 border-1 shadow-lg rounded-md flex flex-col"
      style={{
        backgroundColor: '#181818'
      }}
      >
        <div className="flex justify-between items-center mb-6 text-white">
          <h1 className="text-2xl font-bold">Komunikasi</h1>
          <button
            onClick={handleLogout}
            className="text-rose-800 py-2 px-4 border border-rose-800 rounded-md hover:bg-rose-800 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 mb-4">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-4 p-2 rounded transition-colors duration-200 hover:bg-slate-900">
                <div className="flex items-center mb-1">
                  <strong className="mr-2">{msg.username}</strong>
                  <span className="text-gray-500 text-sm">{dayjs(msg.created_at).format('DD/MM/YYYY h:mm A')}</span>
                  <button 
                  onClick={() => handleReply(msg)} 
                  className="text-sm text-white flex items-center"
                >
                  <FiCornerUpLeft className="ml-2" /> balas
                </button>
                </div>
                {msg.reply_to_message && (
                  <div className="bg-slate-700 py-1 rounded mb-2 text-sm flex items-center">
                    <FiCornerDownRight className="mr-2" />
                    <strong className="mr-1">{msg.reply_to_username}:</strong>
                    <span>{msg.reply_to_message}</span>
                  </div>
                )}
                <div>{msg.message}</div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          {replyTo && (
            <div className="bg-slate-700 p-2 mb-2 rounded text-sm">
              Membalas <strong>{replyTo.username}</strong>: {replyTo.message}
              <button 
                onClick={handleCancelReply} 
                className="text-sm text-red-400 hover:underline ml-2"
              >
                Batalkan
              </button>
            </div>
          )}
        </div>
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