// Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import supabase from '../supabaseClient';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the 'users' table
    const { data, error } = await supabase.from('users').insert([
      {
        username,
        password: hashedPassword,
        email: `${username}@example.com`, // Generating email from username for simplicity
      },
    ]);

    if (error) {
      setError('Error registering user');
      console.error('Error registering user', error);
      return;
    }

    // Auto redirect to login
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Register</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
