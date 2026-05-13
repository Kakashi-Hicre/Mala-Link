'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { authAPI, agenciesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const stored = Cookies.get('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        Cookies.remove('user');
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async ({ email, password }) => {
    const res  = await authAPI.login({ email, password });
    const token = res.data.access_token;

    // Decode the JWT to get user info (middle part is base64 encoded)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userData = { id: payload.sub, email: payload.email, role: payload.role };

    Cookies.set('token', token,              { expires: 7 });
    Cookies.set('user',  JSON.stringify(userData), { expires: 7 });
    setUser(userData);

    toast.success('Welcome back!');
    router.push('/dashboard');
  };

  const staffLogin = async ({ email, password }) => {
    const res   = await agenciesAPI.staffLogin({ email, password });
    const token = res.data.access_token;
    const staff = res.data.staff;

    Cookies.set('token', token,               { expires: 7 });
    Cookies.set('user',  JSON.stringify(staff), { expires: 7 });
    setUser(staff);

    toast.success(`Welcome, ${staff.fullName}`);
    router.push('/staff/applications');
  };

  const register = async (data) => {
    const res   = await authAPI.register(data);
    const token = res.data.access_token;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userData = { id: payload.sub, email: payload.email, role: payload.role };

    Cookies.set('token', token,                { expires: 7 });
    Cookies.set('user',  JSON.stringify(userData), { expires: 7 });
    setUser(userData);

    toast.success('Account created!');
    router.push('/dashboard');
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    toast.success('Logged out');
    router.push('/login');
  };

  return { user, loading, login, staffLogin, register, logout };
};