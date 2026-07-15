import React from 'react';
import ReactDOM from 'react-dom/client';
import { migrateLegacyStorage } from './lib/storageKeys.js';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store/store.js';
import { router } from './router.jsx';
import './styles.css';

migrateLegacyStorage();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
