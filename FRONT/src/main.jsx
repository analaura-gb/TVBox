import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { io } from 'socket.io-client';

function Boot() {
  useEffect(() => {
    const s = io('/', { transports: ['websocket'], query: { role: 'user' } });
    return () => s.close();
  }, []);
  return <App/>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Boot />
    </BrowserRouter>
  </React.StrictMode>
);
