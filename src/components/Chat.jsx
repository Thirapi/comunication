import { useEffect, useState } from 'react';
import { getMessages, sendMessage } from '../api/api';
import Pusher from 'pusher-js';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await getMessages();
      setMessages(response.data);
    };

    fetchMessages();

    const pusher = new Pusher('b5e5ea7da3044ccf79fc', {
      cluster: 'ap1',
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(user.id, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.user_id}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
