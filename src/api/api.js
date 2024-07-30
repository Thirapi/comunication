import axios from 'axios';

const api = axios.create({
  baseURL: 'https://msg-api-eight.vercel.app/api',
});

export const loginUser = (username, password) => {
  return api.post('/users', { username, password });
};

export const registerUser = (username, password) => {
  return api.post('/users', { username, password });
};

export const getMessages = () => {
  return api.get('/messages');
};

export const sendMessage = (userId, message) => {
  return api.post('/messages', { user_id: userId, message });
};
