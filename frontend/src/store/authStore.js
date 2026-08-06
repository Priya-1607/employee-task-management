import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, error: null });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, error: null });
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          get().setAuth(data.user, data.token);
          return data.user;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      register: async (formData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', formData);
          get().setAuth(data.user, data.token);
          return data.user;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/forgot-password', { email });
          return data;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      resetPassword: async (token, password, confirmPassword) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.put(`/auth/reset-password/${token}`, {
            password,
            confirmPassword,
          });
          get().setAuth(data.user, data.token);
          return data;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        get().clearAuth();
      },

      fetchMe: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return null;

        set({ loading: true, error: null });
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, token });
          return data.user;
        } catch (err) {
          get().clearAuth();
          set({ error: err.message });
          return null;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
