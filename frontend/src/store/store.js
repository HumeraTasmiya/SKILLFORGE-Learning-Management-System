import { configureStore, createSlice } from '@reduxjs/toolkit';
import { migrateLegacyStorage, STORAGE } from '../lib/storageKeys.js';

migrateLegacyStorage();
const initialTheme = localStorage.getItem(STORAGE.theme) || 'dark';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: initialTheme,
    chatbotOpen: false,
    certificatePrice: 2.49,
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE.theme, state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    setChatbotOpen(state, action) {
      state.chatbotOpen = action.payload;
    },
  },
});

document.documentElement.classList.toggle('dark', initialTheme === 'dark');

export const { toggleTheme, setChatbotOpen } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
  },
});
