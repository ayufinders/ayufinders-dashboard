"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const {setUser} = useUserContext()

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/user/admin-signin`, 
        { 
          email, 
          password 
        }, {
          withCredentials: true
        });

      if (response.status === 200) {
        const user = {
          name: response.data.admin.name,
          email: response.data.admin.email,
          id: response.data.admin._id,
          loggedIn: true,
          access: response.data.admin.access,
        }
        console.log(user.access)

        setUser(user)
        localStorage.setItem("user", JSON.stringify(user));
        // Redirect to the dashboard
        router.push('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during login');
      } else {
        console.error("Unknown error:", error);
      }
      
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center">Ayufinders</h1>
        <h2 className="text-2xl font-bold text-center text-gray-700">Login to Dashboard</h2>

        {error && (
          <div className="p-2 text-red-600 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white font-semibold bg-gradient-to-b from-gray-500 to-gray-900 rounded-lg mt-4 hover:scale-105 transition-all duration-300"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
