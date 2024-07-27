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

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.error('Invalid password');
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email, // use user's email for auth
      password: user.password // use user's stored hashed password
    });

    if (authError) {
      console.error('Error setting auth session:', authError);
    } else {
      navigate('/chat');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
