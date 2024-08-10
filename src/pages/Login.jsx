import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import image from '/src/assets/image.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, { username, password });

      const { token } = response.data;
      localStorage.setItem('token', token); // Simpan token di localStorage
      navigate('/chat');
    } catch (error) {
      console.error('Error:', error.response?.data);
      setError(error.response?.data?.message || 'Error logging in');
    }
  };

  return (
    <div 
    className="min-h-screen flex items-center justify-center bg-slate-900"
    style={{
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="bg-slate-800 p-8 rounded shadow-md w-full max-w-md border-solid border-slate-300 border-2">
        <h1 className="text-2xl text-white font-bold mb-6">Login</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block  text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <button type="submit" className="text-white font-semibold w-full py-2 px-4 rounded-md border-2 border-transparent bg-gradient-to-r from-green-400 via-purple-500 to-red-600 bg-clip-border hover:bg-gradient-to-r hover:from-green-400 hover:via-purple-500 hover:to-red-600 hover:text-white">
            Login bro
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
