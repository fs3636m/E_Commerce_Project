import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import store from "./store/store";
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/sonner";

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
