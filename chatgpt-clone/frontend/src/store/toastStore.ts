import { create } from 'zustand';
import type { ToastType } from '../components/Toast';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (type, message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'success', message }],
    }));
  },

  error: (message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'error', message }],
    }));
  },

  warning: (message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'warning', message }],
    }));
  },

  info: (message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'info', message }],
    }));
  },
}));
