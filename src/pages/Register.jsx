import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import bcrypt from 'bcryptjs';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase.from('users').insert([
      { username, password: hashedPassword }
    ]);

    if (error) {
      console.error('Error registering user', error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
            <input type="text" id="username" className="w-full px-3 py-2 border rounded-lg" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input type="password" id="password" className="w-full px-3 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
