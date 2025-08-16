import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { io } from "socket.io-client";
import './index.css';

function Root() {
  useEffect(() => {
    const s = io('/', { transports: ['websocket'], query: { role: 'user' } });
    return () => s.close();
  }, []);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
