import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import bcrypt from 'bcryptjs';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Fetch the user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      console.error('User not found', error);
      return;
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // Successful login
      navigate('/chat');
    } else {
      console.error('Password mismatch');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
            <input type="text" id="username" className="w-full px-3 py-2 border rounded-lg" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input type="password" id="password" className="w-full px-3 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
