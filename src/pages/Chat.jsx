// Chat.jsx
import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: session, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error('Error fetching session', error);
        navigate('/login');  // Redirect to login if no session
      } else {
        setUser(session.user);
      }
    };

    getSession();

    const fetchMessages = async () => {
      const { data, error } = await supabase.from('messages').select('*');
      if (error) console.error('Error fetching messages', error);
      else setMessages(data);
    };

    fetchMessages();

    const messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((currentMessages) => [...currentMessages, payload.new]);
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const { error } = await supabase.from('messages').insert([{ content: newMessage, user_id: user.id }]);
    if (error) console.error('Error sending message', error);
    else setNewMessage('');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="send-message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
